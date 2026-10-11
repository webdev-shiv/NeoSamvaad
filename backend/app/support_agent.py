import json
import logging
from typing import Any, Dict, List, Optional

try:
    from app.config import Settings, get_settings
    from app.schemas import ChatResponse, EvidenceItem, TicketHistoryItem
except ImportError:
    from .config import Settings, get_settings
    from .schemas import ChatResponse, EvidenceItem, TicketHistoryItem

logger = logging.getLogger("support_agent")

SYSTEM_PROMPT = """You are a customer-support assistant grounded strictly in retrieved graph evidence.

Use the supplied retrieved records as the ONLY source for claims about the customer's previous tickets and troubleshooting history.

Rules:
- Never claim an action was attempted unless the retrieved evidence explicitly says so.
- Never claim a fix succeeded unless a recorded outcome supports it.
- Do not recommend repeating a step recorded as FAILED unless you explain why a materially different retry is justified.
- Separate retrieved facts from hypotheses and recommendations.
- If the records are missing, ambiguous, or empty, say so honestly and do not invent any history.
- Do not claim to have checked, modified, or accessed a live production customer account.
- Recommend safe, reversible next steps; escalate when evidence is insufficient or requires privileged account access.
- Keep the response concise and refer to ticket IDs when available.

You must respond in valid JSON format matching this exact JSON schema:
{
  "answer": "string (customer-facing explanation grounded in retrieved facts)",
  "evidence": [
    {
      "ticket_id": "string",
      "attempt": "string",
      "outcome": "string"
    }
  ],
  "suggested_next_step": "string (safe next action avoiding failed steps)",
  "uncertainty": "string (explicit statement of missing or unverified information)"
}
"""


class SupportAgent:
    """Orchestrates evidence formatting and Google Gemini-grounded response generation."""

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or get_settings()

    def build_evidence_context(self, history: List[TicketHistoryItem]) -> str:
        """Convert retrieved ticket and attempt records into structured text context."""
        if not history:
            return "NO PRIOR SUPPORT HISTORY FOUND FOR THIS CUSTOMER."

        context_lines = ["RETRIEVED GRAPH HISTORY:"]
        for t in history:
            context_lines.append(
                f"- Ticket ID: {t.ticket_id} | Status: {t.ticket_status} | Created: {t.created_at}"
            )
            if t.product_id or t.product_name:
                context_lines.append(
                    f"  Product: {t.product_id} ({t.product_name})"
                )
            if t.issue_category or t.issue_description:
                context_lines.append(
                    f"  Issue: {t.issue_category} - {t.issue_description}"
                )
            if not t.attempts:
                context_lines.append("  Attempts: No previous troubleshooting recorded.")
            else:
                for att in t.attempts:
                    note_str = f", notes='{att.notes}'" if att.notes else ""
                    context_lines.append(
                        f"  Attempt: method='{att.method}', outcome='{att.outcome}', "
                        f"action='{att.resolution_action}', status='{att.resolution_status}'{note_str}"
                    )
        return "\n".join(context_lines)

    def generate_fallback_response(
        self,
        customer_id: str,
        message: str,
        history: List[TicketHistoryItem],
        evidence: List[EvidenceItem],
        reason: str,
    ) -> ChatResponse:
        """
        Deterministic, rule-based fallback response grounded in retrieved graph evidence.
        Ensures the application never crashes when the LLM service is offline or unconfigured.
        """
        logger.info(
            f"[PROVIDER: FALLBACK] Generating deterministic response for customer '{customer_id}'. Reason: {reason}"
        )
        if not history:
            return ChatResponse(
                answer=(
                    f"Hello! I checked our records for customer {customer_id}, and no prior support history "
                    f"was found. Could you please describe what issue you are experiencing?"
                ),
                evidence=[],
                suggested_next_step="Provide product and issue details to create a new support ticket.",
                uncertainty=f"No historical records found for this customer ID in the graph. Fallback used ({reason}).",
            )

        failed_attempts = [e for e in evidence if e.outcome.upper() == "FAILED"]
        successful_attempts = [e for e in evidence if e.outcome.upper() == "SUCCESS"]

        if failed_attempts:
            failed_methods = ", ".join([f"'{f.attempt}'" for f in failed_attempts])
            ticket_refs = ", ".join(sorted(list({f.ticket_id for f in failed_attempts})))
            answer = (
                f"I checked your previous support history ({ticket_refs}). Our records show that "
                f"{failed_methods} was already attempted and resulted in FAILED. "
                f"We will not repeat that step. Let's inspect the specific error details instead."
            )
            suggested_next_step = (
                "Review error logs or session status instead of repeating the failed troubleshooting action."
            )
        elif successful_attempts:
            ticket_refs = ", ".join(sorted(list({s.ticket_id for s in successful_attempts})))
            answer = (
                f"Our records show prior ticket {ticket_refs} was previously resolved. "
                f"If you are facing a recurring or new issue, let's diagnose the current symptoms."
            )
            suggested_next_step = "Confirm whether current symptoms match the previous resolved incident."
        else:
            ticket_refs = ", ".join([t.ticket_id for t in history])
            answer = (
                f"I found open support ticket(s) ({ticket_refs}), but no troubleshooting attempts have been recorded yet."
            )
            suggested_next_step = "Initiate initial diagnosis for the reported issue."

        uncertainty = (
            f"Note: Response synthesized using deterministic grounder ({reason}). "
            f"Account status has not been verified against live identity providers."
        )

        return ChatResponse(
            answer=answer,
            evidence=evidence,
            suggested_next_step=suggested_next_step,
            uncertainty=uncertainty,
            provider="fallback",
        )

    def answer_query(
        self,
        customer_id: str,
        message: str,
        history: List[TicketHistoryItem],
        evidence: List[EvidenceItem],
    ) -> ChatResponse:
        """
        Produce a grounded answer using Google Gemini with evidence context,
        or graceful fallback if Gemini is unconfigured or unavailable.
        """
        if not self.settings.is_llm_configured:
            return self.generate_fallback_response(
                customer_id,
                message,
                history,
                evidence,
                reason="Gemini API key not configured",
            )

        try:
            from google import genai
            from google.genai import types

            logger.info(
                f"[PROVIDER: GEMINI] Calling Google Gemini model '{self.settings.llm_model}' for customer '{customer_id}'"
            )
            client = genai.Client(api_key=self.settings.effective_gemini_api_key)
            context_str = self.build_evidence_context(history)

            user_prompt = f"""Customer ID: {customer_id}
Customer Message: "{message}"

{context_str}

Please generate the grounded response adhering strictly to the system rules."""

            response = client.models.generate_content(
                model=self.settings.llm_model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )

            raw_content = response.text or "{}"
            cleaned_text = raw_content.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            parsed = json.loads(cleaned_text)

            # Validate and convert evidence items
            raw_ev = parsed.get("evidence", [])
            parsed_evidence = []
            for ev in raw_ev:
                if isinstance(ev, dict) and "ticket_id" in ev and "attempt" in ev:
                    parsed_evidence.append(
                        EvidenceItem(
                            ticket_id=str(ev.get("ticket_id")),
                            attempt=str(ev.get("attempt")),
                            outcome=str(ev.get("outcome", "RECORDED")),
                        )
                    )

            # Fall back to retrieved evidence if LLM omitted them but evidence exists
            final_evidence = parsed_evidence if parsed_evidence else evidence

            logger.info(
                f"[PROVIDER: GEMINI SUCCESS] Successfully received structured response from Google Gemini for customer '{customer_id}'"
            )

            return ChatResponse(
                answer=parsed.get("answer", "Here is what we found in your records."),
                evidence=final_evidence,
                suggested_next_step=parsed.get(
                    "suggested_next_step",
                    "Proceed with diagnostic inspection.",
                ),
                uncertainty=parsed.get(
                    "uncertainty",
                    "Live account status unverified by prototype.",
                ),
                provider="gemini",
            )

        except Exception as e:
            logger.warning(f"[PROVIDER: GEMINI ERROR] Google Gemini call failed ({type(e).__name__}): {e}")
            return self.generate_fallback_response(
                customer_id,
                message,
                history,
                evidence,
                reason=f"Gemini API error ({type(e).__name__})",
            )

