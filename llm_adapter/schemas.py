"""Pydantic schemas for LLM Grounding and Response Contract.

These schemas are used both for validating incoming Neo4j evidence
and strictly validating model-generated structured outputs.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator


class GraphNode(BaseModel):
    """A node in the Neo4j graph representation."""
    id: str
    type: str  # e.g. Customer, Ticket, Issue, Attempt, Outcome
    label: str


class GraphRelationship(BaseModel):
    """A directed edge in the Neo4j graph representation."""
    source: str
    target: str
    type: str  # e.g. FILED_TICKET, HAS_ISSUE, TRIED_ACTION, RESULTED_IN


class GraphPath(BaseModel):
    """A truthful path of nodes and edges retrieved from Neo4j."""
    nodes: List[GraphNode] = Field(default_factory=list)
    relationships: List[GraphRelationship] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    """An authoritative evidence record retrieved from Neo4j."""
    ticket_id: str
    issue: Optional[str] = None
    attempt: str
    outcome: Literal["FAILED", "RESOLVED", "IN_PROGRESS", "ABANDONED", "UNKNOWN"]
    timestamp: Optional[str] = None
    notes: Optional[str] = None


class CustomerContext(BaseModel):
    """Customer identity and authorized scope."""
    customer_id: str
    name: Optional[str] = None
    tier: Optional[str] = "Standard"
    authorized_ticket_ids: List[str] = Field(default_factory=list)


class GroundingInput(BaseModel):
    """Complete grounded input provided to the LLM."""
    customer_context: CustomerContext
    current_message: str
    retrieved_evidence: List[EvidenceItem] = Field(default_factory=list)
    graph_paths: List[GraphPath] = Field(default_factory=list)


class AgentResponse(BaseModel):
    """Structured response contract for customer-facing answers."""
    answer: str = Field(
        ...,
        description="Customer-facing response grounded strictly in retrieved evidence."
    )
    evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="Authoritative evidence items backing the answer (subset of retrieved evidence)."
    )
    graph_paths: List[GraphPath] = Field(
        default_factory=list,
        description="Graph traversal paths backing the answer."
    )
    suggested_next_step: str = Field(
        ...,
        description="Recommended action avoiding repeat of failed steps without justified reason."
    )
    uncertainty: str = Field(
        ...,
        description="Explicit statement of unconfirmed hypotheses or missing historical evidence."
    )
    is_mock: bool = Field(
        default=False,
        description="Explicit flag distinguishing mock/demo responses from real LLM outputs."
    )
    confidence_level: Literal["GROUNDED_HIGH", "LIMITED_EVIDENCE", "NO_HISTORY", "UNCONFIRMED"] = Field(
        default="GROUNDED_HIGH",
        description="Confidence category determined by evidence completeness."
    )

    @field_validator("answer")
    @classmethod
    def answer_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Answer must not be empty.")
        return v.strip()
