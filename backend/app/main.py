import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.config import get_settings
    from app.neo4j_client import get_neo4j_client
    from app.retrieval import CustomerHistoryRetriever
    from app.schemas import (
        ChatRequest,
        ChatResponse,
        CustomerHistoryResponse,
        HealthResponse,
        TicketCreateRequest,
        TicketResponse,
        IssueReportWorkflowRequest,
        IssueReportWorkflowResponse,
        LiveGraphResponse,
    )
    from app.support_agent import SupportAgent
except ImportError:
    from .config import get_settings
    from .neo4j_client import get_neo4j_client
    from .retrieval import CustomerHistoryRetriever
    from .schemas import (
        ChatRequest,
        ChatResponse,
        CustomerHistoryResponse,
        HealthResponse,
        TicketCreateRequest,
        TicketResponse,
        IssueReportWorkflowRequest,
        IssueReportWorkflowResponse,
        LiveGraphResponse,
    )
    from .support_agent import SupportAgent

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for driver resource management."""
    settings = get_settings()
    client = get_neo4j_client()
    logger.info("Initializing Context-Aware Support Agent backend with Neo4j and Gemini...")
    if settings.is_neo4j_configured:
        connected = client.verify_connectivity()
        logger.info(f"Neo4j connection test on startup: {'SUCCESS' if connected else 'FAILED/OFFLINE'}")
    else:
        logger.info("Neo4j is not fully configured yet; will run in standalone mode.")
    yield
    logger.info("Shutting down backend and closing database connections.")
    client.close()


app = FastAPI(
    title="Context-Aware Support Agent API",
    description="GraphRAG backend powered by Neo4j and LLM for resolution-aware customer support memory.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"], include_in_schema=False)
def health_check():
    """Health status check endpoint reporting Neo4j and LLM readiness."""
    settings = get_settings()
    client = get_neo4j_client()
    neo4j_ok = client.verify_connectivity()
    return HealthResponse(
        status="ok",
        neo4j_connected=neo4j_ok,
        llm_configured=settings.is_llm_configured,
        app_env=settings.app_env,
    )


@app.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED, tags=["Tickets"])
@app.post("/api/v1/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED, tags=["Tickets"], include_in_schema=False)
def create_ticket(request: TicketCreateRequest):
    """
    Create a new support ticket connected to a customer, product, and issue.
    Maintains graph relationships and prevents duplicate customer/product nodes.
    """
    client = get_neo4j_client()
    if not client.verify_connectivity():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neo4j database is unavailable. Please verify connection credentials.",
        )

    retriever = CustomerHistoryRetriever(client=client)
    try:
        created = retriever.create_ticket(
            customer_id=request.customer_id,
            product_id=request.product_id,
            issue_description=request.issue_description,
            category=request.category,
        )
        return TicketResponse(
            ticket_id=created["ticket_id"],
            status=created["status"],
            customer_id=created["customer_id"],
            product_id=created["product_id"],
            issue_id=created["issue_id"],
            created_at=created["created_at"],
        )
    except Exception as e:
        logger.error(f"Failed to create ticket: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error persisting ticket in Neo4j: {str(e)}",
        )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Chat"], include_in_schema=False)
def chat_with_agent(request: ChatRequest):
    """
    Main GraphRAG chat endpoint:
    1. Validates customer_id and input.
    2. Retrieves connected ticket history, previous attempts, and outcomes from Neo4j.
    3. Builds bounded evidence context and queries the grounded support agent.
    4. Returns grounded answer, evidence references, suggested next step, and uncertainty.
    """
    client = get_neo4j_client()
    retriever = CustomerHistoryRetriever(client=client)
    agent = SupportAgent()

    # Step 1: Retrieve history from graph if database is online
    history = []
    if client.verify_connectivity():
        try:
            history = retriever.get_customer_history(customer_id=request.customer_id)
        except Exception as e:
            logger.error(f"Retrieval failure for customer {request.customer_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to retrieve graph history from Neo4j: {str(e)}",
            )
    else:
        logger.warning("Neo4j offline; proceeding with empty history and graceful notification.")

    # Step 2: Extract verifiable evidence
    evidence = retriever.extract_evidence(history)

    # Step 3: Grounded response generation
    response = agent.answer_query(
        customer_id=request.customer_id,
        message=request.message,
        history=history,
        evidence=evidence,
    )

    # Step 4: Populate live graph path traversals for UI explorer
    graph_paths = []
    for t in history:
        nodes = [
            {"id": t.ticket_id, "type": "Ticket", "label": f"Ticket {t.ticket_id}"}
        ]
        relationships = []
        if t.issue_id:
            nodes.append({"id": t.issue_id, "type": "Issue", "label": t.issue_category or "Issue"})
            relationships.append({"source": t.ticket_id, "target": t.issue_id, "type": "CONCERNS"})
        if t.product_id:
            nodes.append({"id": t.product_id, "type": "Product", "label": t.product_name or t.product_id})
            relationships.append({"source": t.ticket_id, "target": t.product_id, "type": "INVOLVES"})
        for att in t.attempts:
            if att.attempt_id:
                nodes.append({"id": att.attempt_id, "type": "Attempt", "label": att.method or "Attempt"})
                relationships.append({"source": t.ticket_id, "target": att.attempt_id, "type": "HAS_ATTEMPT"})
                if att.outcome:
                    outcome_id = f"OUTCOME-{att.attempt_id}"
                    nodes.append({"id": outcome_id, "type": "Outcome", "label": att.outcome})
                    relationships.append({"source": att.attempt_id, "target": outcome_id, "type": "RESULTED_IN"})
        graph_paths.append({"nodes": nodes, "relationships": relationships})

    response.graph_paths = graph_paths
    response.confidence_level = "GROUNDED_HIGH" if evidence else ("NO_HISTORY" if not history else "LIMITED_EVIDENCE")
    response.is_mock = False

    return response


@app.get("/customers/{customer_id}/history", response_model=CustomerHistoryResponse, tags=["History"])
@app.get("/api/v1/customers/{customer_id}/history", response_model=CustomerHistoryResponse, tags=["History"], include_in_schema=False)
def get_customer_history(customer_id: str):
    """
    Retrieve customer ticket and troubleshooting history for UI evidence panel.
    Returns an empty history list if customer has no prior records or is unknown.
    """
    client = get_neo4j_client()
    if not client.verify_connectivity():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neo4j database is unavailable. Please verify connection credentials.",
        )

    retriever = CustomerHistoryRetriever(client=client)
    try:
        history = retriever.get_customer_history(customer_id=customer_id)
        return CustomerHistoryResponse(
            customer_id=customer_id,
            history=history,
        )
    except Exception as e:
        logger.error(f"Failed to fetch history for customer {customer_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading history from Neo4j: {str(e)}",
        )


@app.get("/graph/live", response_model=LiveGraphResponse, tags=["Graph"])
@app.get("/api/v1/graph/live", response_model=LiveGraphResponse, tags=["Graph"], include_in_schema=False)
def get_live_graph(limit: int = 60):
    """
    Retrieve live nodes and relationships from active Neo4j AuraDB graph.
    Powers the interactive graph canvas with real database data.
    """
    client = get_neo4j_client()
    if not client.verify_connectivity():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neo4j database is unavailable. Please verify connection credentials.",
        )
    retriever = CustomerHistoryRetriever(client=client)
    try:
        data = retriever.get_live_graph(limit=limit)
        return LiveGraphResponse(**data)
    except Exception as e:
        logger.error(f"Failed to fetch live graph: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying Neo4j live graph: {str(e)}",
        )


@app.post("/issues/report", response_model=IssueReportWorkflowResponse, status_code=status.HTTP_201_CREATED, tags=["Tickets"])
@app.post("/api/v1/issues/report", response_model=IssueReportWorkflowResponse, status_code=status.HTTP_201_CREATED, tags=["Tickets"], include_in_schema=False)
def report_issue_workflow(request: IssueReportWorkflowRequest):
    """
    Minimum Demo Requirement:
    1. Report an issue
    2. Store full chain in Neo4j (Customer -> Product -> Issue -> Ticket -> Attempt -> Resolution)
    """
    client = get_neo4j_client()
    if not client.verify_connectivity():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neo4j database is unavailable. Please verify connection credentials.",
        )
    retriever = CustomerHistoryRetriever(client=client)
    try:
        result = retriever.create_issue_workflow(
            customer_id=request.customer_id,
            product_id=request.product_id,
            issue_description=request.issue_description,
            category=request.category or "login_failure",
            attempt_method=request.attempt_method or "password_reset",
            attempt_outcome=request.attempt_outcome or "FAILED",
            attempt_notes=request.attempt_notes or "Troubleshooting action attempted and failed",
            resolution_status=request.resolution_status or "UNRESOLVED",
        )
        return IssueReportWorkflowResponse(**result)
    except Exception as e:
        logger.error(f"Failed to execute issue workflow in Neo4j: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing issue workflow in Neo4j: {str(e)}",
        )


