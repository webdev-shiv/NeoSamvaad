"""Grounding Validator for LLM responses.

Performs deterministic post-generation validation to catch hallucinations,
fabricated citations, and ungrounded claims before returning to the frontend.
"""

import re
from typing import List, Tuple
from .schemas import EvidenceItem, AgentResponse


class GroundingValidationError(Exception):
    """Raised when an LLM response violates grounding rules."""
    pass


class GroundingValidator:
    """Validates candidate responses against authoritative Neo4j evidence."""

    @staticmethod
    def validate_ticket_citations(
        candidate_tickets: List[str],
        authoritative_evidence: List[EvidenceItem]
    ) -> List[EvidenceItem]:
        """Ensures every ticket cited by the model actually exists in retrieved evidence.

        Returns only the genuine matching EvidenceItem instances.
        """
        valid_ids = {e.ticket_id for e in authoritative_evidence}
        filtered_evidence = []

        for tid in candidate_tickets:
            if tid not in valid_ids:
                # Hallucinated ticket ID detected!
                raise GroundingValidationError(
                    f"Model cited ticket '{tid}' which was not in retrieved Neo4j evidence."
                )
            for item in authoritative_evidence:
                if item.ticket_id == tid and item not in filtered_evidence:
                    filtered_evidence.append(item)

        # If no tickets were specifically cited by model, include relevant authoritative evidence
        if not filtered_evidence and authoritative_evidence:
            filtered_evidence = authoritative_evidence

        return filtered_evidence

    @staticmethod
    def validate_failed_attempt_cycles(
        answer: str,
        suggested_next_step: str,
        authoritative_evidence: List[EvidenceItem]
    ) -> None:
        """Flags recommending a failed attempt without a stated change in approach."""
        combined_text = f"{answer} {suggested_next_step}".lower()

        for item in authoritative_evidence:
            if item.outcome == "FAILED":
                attempt_name = item.attempt.lower().replace("_", " ")
                # Check if model recommends doing the exact same attempt blindly
                if attempt_name in combined_text:
                    # Must contain mitigation/justification keywords
                    justification_keywords = [
                        "different", "instead", "new approach", "alternative",
                        "verify", "investigate", "check", "prior to", "before repeating",
                        "because", "failed", "rather than", "did not resolve", "change"
                    ]
                    has_justification = any(k in combined_text for k in justification_keywords)
                    if not has_justification:
                        raise GroundingValidationError(
                            f"Model recommended repeating failed action '{item.attempt}' "
                            f"without an explained change in approach or justification."
                        )

    @staticmethod
    def validate_empty_history_acknowledgement(
        answer: str,
        authoritative_evidence: List[EvidenceItem]
    ) -> None:
        """When evidence is absent, the model must explicitly state that history is unavailable."""
        if not authoritative_evidence:
            lower_answer = answer.lower()
            acknowledgement_phrases = [
                "no historical", "no previous", "no record", "no existing ticket",
                "unavailable", "not found", "new account", "no past", "first time"
            ]
            if not any(phrase in lower_answer for phrase in acknowledgement_phrases):
                raise GroundingValidationError(
                    "Retrieved history was empty, but the model failed to explicitly "
                    "acknowledge that historical evidence is unavailable."
                )

    @classmethod
    def sanitize_and_validate(
        cls,
        raw_response: dict,
        authoritative_evidence: List[EvidenceItem],
        graph_paths: list = None
    ) -> AgentResponse:
        """Full validation pipeline converting raw dictionary to validated AgentResponse."""
        answer = raw_response.get("answer", "")
        suggested_next_step = raw_response.get("suggested_next_step", "")
        uncertainty = raw_response.get("uncertainty", "None reported.")
        is_mock = raw_response.get("is_mock", False)
        candidate_tickets = raw_response.get("evidence_ticket_ids", [])

        # 1. Validate empty history statement
        cls.validate_empty_history_acknowledgement(answer, authoritative_evidence)

        # 2. Validate ticket citations against Neo4j evidence
        matched_evidence = cls.validate_ticket_citations(candidate_tickets, authoritative_evidence)

        # 3. Guard against repeating failed attempts
        cls.validate_failed_attempt_cycles(answer, suggested_next_step, authoritative_evidence)

        # 4. Determine confidence level
        confidence = "GROUNDED_HIGH"
        if not authoritative_evidence:
            confidence = "NO_HISTORY"
        elif any(e.outcome == "FAILED" for e in authoritative_evidence):
            confidence = "LIMITED_EVIDENCE"

        return AgentResponse(
            answer=answer,
            evidence=matched_evidence,
            graph_paths=graph_paths or [],
            suggested_next_step=suggested_next_step,
            uncertainty=uncertainty,
            is_mock=is_mock,
            confidence_level=confidence
        )
