"""Provider-neutral LLM Generator with strict Grounding Validation.

Supports Gemini, OpenAI, and an explicit deterministic Mock/Demo mode.
Never silently substitutes mock for real: sets is_mock=True explicitly.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from .schemas import GroundingInput, AgentResponse, EvidenceItem
from .prompts import SYSTEM_GROUNDING_INSTRUCTION, build_grounded_user_prompt
from .validator import GroundingValidator, GroundingValidationError

logger = logging.getLogger(__name__)


class LLMAdapter:
    """Provider-neutral LLM generation adapter."""

    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None):
        self.provider = provider or os.getenv("LLM_PROVIDER", "mock").lower()
        self.model = model or os.getenv("LLM_MODEL", "gemini-2.5-flash")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

        if self.provider == "gemini" and not self.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set. Falling back to explicit mock mode.")
            self.provider = "mock"
        elif self.provider == "openai" and not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not set. Falling back to explicit mock mode.")
            self.provider = "mock"

    def generate_response(self, grounding_input: GroundingInput) -> AgentResponse:
        """Generates and validates a grounded support response."""
        user_prompt = build_grounded_user_prompt(
            customer_id=grounding_input.customer_context.customer_id,
            customer_tier=grounding_input.customer_context.tier or "Standard",
            retrieved_evidence=grounding_input.retrieved_evidence,
            current_message=grounding_input.current_message,
        )

        # 1. Fetch raw output from active provider
        if self.provider == "gemini":
            raw_data = self._generate_gemini(user_prompt)
        elif self.provider == "openai":
            raw_data = self._generate_openai(user_prompt)
        else:
            raw_data = self._generate_mock(grounding_input)

        # 2. Validate against authoritative Neo4j evidence
        validated = GroundingValidator.sanitize_and_validate(
            raw_response=raw_data,
            authoritative_evidence=grounding_input.retrieved_evidence,
            graph_paths=grounding_input.graph_paths,
        )

        return validated

    def _generate_mock(self, input_data: GroundingInput) -> Dict[str, Any]:
        """Deterministic mock generator for testing and standalone demonstration.

        Accurately simulates grounded reasoning for Scenarios A, B, C, and E.
        Always sets is_mock=True.
        """
        msg = input_data.current_message.lower()
        evidence = input_data.retrieved_evidence

        # Check prompt injection attempt (Scenario E)
        if any(w in msg for w in ["ignore previous", "system prompt", "other customer", "reveal credentials"]):
            return {
                "answer": "I am a secure customer support assistant. I cannot disclose internal system prompts or other customer records. How can I assist you with your account today?",
                "evidence_ticket_ids": [],
                "suggested_next_step": "Please submit queries regarding your authorized account services only.",
                "uncertainty": "Request contained unauthorized administrative commands.",
                "is_mock": True,
            }

        # Scenario C: Empty history
        if not evidence:
            return {
                "answer": (
                    f"Welcome to support! No historical support records are available for your account "
                    f"({input_data.customer_context.customer_id}). Based on your request, I'm here to assist "
                    f"you with getting set up from scratch."
                ),
                "evidence_ticket_ids": [],
                "suggested_next_step": "Please provide your specific error code or onboarding step to proceed.",
                "uncertainty": "No previous troubleshooting records exist in the knowledge graph for this account.",
                "is_mock": True,
            }

        # Scenario B: Missing specific historical evidence (unrecorded action query)
        recorded_attempts = [e.attempt.lower().replace("_", " ") for e in evidence]
        is_asking_unrecorded = any(
            term in msg for term in ["session cache", "cache", "server restart", "did you already", "unrecorded"]
        ) and not any(att in msg for att in recorded_attempts)

        if is_asking_unrecorded and evidence:
            first_ticket = evidence[0]
            return {
                "answer": (
                    f"According to your support records for ticket {first_ticket.ticket_id}, our recorded action was "
                    f"'{first_ticket.attempt}'. The action you mentioned cannot be confirmed from our available "
                    f"historical records."
                ),
                "evidence_ticket_ids": [first_ticket.ticket_id],
                "suggested_next_step": "Verify whether the unconfirmed action was taken independently outside our support portal.",
                "uncertainty": "Requested troubleshooting action is not present in retrieved Neo4j records.",
                "is_mock": True,
            }

        # Scenario A: Failed attempt present
        failed_attempts = [e for e in evidence if e.outcome == "FAILED"]
        if failed_attempts:
            failed_item = failed_attempts[0]
            attempt_label = failed_item.attempt.replace("_", " ")
            return {
                "answer": (
                    f"I reviewed your records and noticed that a previous {attempt_label} for ticket "
                    f"{failed_item.ticket_id} had an outcome of FAILED. Rather than repeating that failed action, "
                    f"we should inspect your account authentication logs to identify why it didn't complete."
                ),
                "evidence_ticket_ids": [failed_item.ticket_id],
                "suggested_next_step": "Inspect IAM access logs and check if the account is temporarily locked.",
                "uncertainty": f"Root cause of failure in ticket {failed_item.ticket_id} is unconfirmed until IAM logs are checked.",
                "is_mock": True,
            }

    def _generate_gemini(self, prompt: str) -> Dict[str, Any]:
        """Calls Google Gemini API with JSON output mode."""
        try:
            from google import genai
            client = genai.Client(api_key=self.gemini_api_key)
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    "system_instruction": SYSTEM_GROUNDING_INSTRUCTION,
                    "response_mime_type": "application/json",
                }
            )
            data = json.loads(response.text)
            data["is_mock"] = False
            return data
        except Exception as e:
            logger.error(f"Gemini API generation failed: {e}")
            raise RuntimeError(f"Gemini generation error: {e}")

    def _generate_openai(self, prompt: str) -> Dict[str, Any]:
        """Calls OpenAI API with JSON object response format."""
        try:
            import urllib.request
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": SYSTEM_GROUNDING_INSTRUCTION},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                content = result["choices"][0]["message"]["content"]
                data = json.loads(content)
                data["is_mock"] = False
                return data
        except Exception as e:
            logger.error(f"OpenAI API generation failed: {e}")
            raise RuntimeError(f"OpenAI generation error: {e}")
