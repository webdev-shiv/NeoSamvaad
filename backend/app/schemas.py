from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# Ticket schemas
class TicketCreateRequest(BaseModel):
    customer_id: str = Field(..., min_length=1, description="Stable customer identifier (e.g., C-001)")
    product_id: str = Field(..., min_length=1, description="Stable product identifier (e.g., P-LOGIN)")
    issue_description: str = Field(..., min_length=3, description="Description of the customer issue")
    category: str = Field(..., min_length=1, description="Categorization key for the issue")


class TicketResponse(BaseModel):
    ticket_id: str
    status: str
    customer_id: str
    product_id: str
    issue_id: str
    created_at: str


# Chat schemas
class ChatRequest(BaseModel):
    customer_id: str = Field(..., min_length=1, description="Customer submitting the query")
    message: str = Field(..., min_length=1, description="Customer message or complaint")
    session_id: Optional[str] = "default_session"


class EvidenceItem(BaseModel):
    ticket_id: str
    attempt: str
    outcome: str


class ChatResponse(BaseModel):
    answer: str
    evidence: List[EvidenceItem] = Field(default_factory=list)
    suggested_next_step: str
    uncertainty: str
    provider: Optional[str] = "gemini"
    graph_paths: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    confidence_level: Optional[str] = "GROUNDED_HIGH"
    is_mock: Optional[bool] = False


# Customer history schemas
class AttemptHistoryItem(BaseModel):
    attempt_id: Optional[str] = None
    method: Optional[str] = None
    outcome: Optional[str] = None
    timestamp: Optional[str] = None
    notes: Optional[str] = None
    resolution_action: Optional[str] = None
    resolution_status: Optional[str] = None


class TicketHistoryItem(BaseModel):
    ticket_id: str
    ticket_status: Optional[str] = None
    created_at: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    issue_id: Optional[str] = None
    issue_category: Optional[str] = None
    issue_description: Optional[str] = None
    attempts: List[AttemptHistoryItem] = Field(default_factory=list)


class CustomerHistoryResponse(BaseModel):
    customer_id: str
    history: List[TicketHistoryItem] = Field(default_factory=list)


# Health schema
class HealthResponse(BaseModel):
    status: str
    neo4j_connected: bool
    llm_configured: bool
    app_env: str


# Issue reporting workflow schema
class IssueReportWorkflowRequest(BaseModel):
    customer_id: str = Field(..., min_length=1, description="Customer ID")
    product_id: str = Field(..., min_length=1, description="Product ID")
    issue_description: str = Field(..., min_length=3, description="Issue description")
    category: Optional[str] = Field("login_failure", description="Issue category")
    attempt_method: Optional[str] = Field("password_reset", description="Attempted troubleshooting method")
    attempt_outcome: Optional[str] = Field("FAILED", description="Outcome (FAILED, SUCCESS, IN_PROGRESS)")
    attempt_notes: Optional[str] = Field("Troubleshooting action attempted and failed", description="Notes on attempt")
    resolution_status: Optional[str] = Field("UNRESOLVED", description="Resolution status (UNRESOLVED, RESOLVED)")


class IssueReportWorkflowResponse(BaseModel):
    ticket_id: str
    customer_id: str
    product_id: str
    issue_id: str
    attempt_id: str
    resolution_id: str
    status: str
    outcome: str
    created_at: str


# Live graph schemas
class LiveGraphNode(BaseModel):
    id: str
    label: str
    type: str
    color: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)


class LiveGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str


class LiveGraphResponse(BaseModel):
    nodes: List[LiveGraphNode]
    edges: List[LiveGraphEdge]
    total_nodes: int
    total_edges: int
    neo4j_connected: bool
