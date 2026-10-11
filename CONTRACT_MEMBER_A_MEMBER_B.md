# API & Architecture Contract: Member A <-> Member B
## Context-Aware Customer Support Agent (Neo4j Graph-RAG + React Frontend)

This contract establishes the shared interface between:
- **Member A**: Neo4j Database, Cypher Graph Retrieval, FastAPI Backend Services.
- **Member B**: LLM Grounding & Response Generation Adapter, Response Validation, React Frontend, Evidence Visualization, Test Suites.

---

## 1. REST Endpoints Specification (FastAPI)

### Base URL
Configured via `VITE_API_BASE_URL` in frontend (default: `http://localhost:8000/api/v1`).

---

### Endpoint 1: Send Customer Message & Generate Grounded Response
* **Route:** `POST /api/v1/chat`
* **Description:** Receives the customer's message and customer identifier, queries Neo4j for customer history/evidence, formats the grounded prompt, invokes the LLM adapter, validates the grounded response, and returns the response.

#### Request Body (`ChatRequest`):
```json
{
  "customer_id": "CUST-1042",
  "message": "My account still isn't working.",
  "session_id": "sess_8f93a"
}
```

#### Response Body (`ChatResponse`):
```json
{
  "answer": "I see that a previous password reset attempt for ticket T-101 failed on 2026-10-10. Because that reset did not resolve the issue, let's check whether your account is locked due to multiple failed login attempts before trying another reset.",
  "evidence": [
    {
      "ticket_id": "T-101",
      "issue": "Account Login Failure",
      "attempt": "password_reset",
      "outcome": "FAILED",
      "timestamp": "2026-10-10T14:30:00Z",
      "notes": "User did not receive SMS code; token expired"
    }
  ],
  "graph_paths": [
    {
      "nodes": [
        {"id": "T-101", "type": "Ticket", "label": "Ticket T-101"},
        {"id": "ISSUE-1", "type": "Issue", "label": "Account Login Failure"},
        {"id": "ATTEMPT-1", "type": "Attempt", "label": "Password Reset"},
        {"id": "OUTCOME-1", "type": "Outcome", "label": "FAILED"}
      ],
      "relationships": [
        {"source": "T-101", "target": "ISSUE-1", "type": "HAS_ISSUE"},
        {"source": "ISSUE-1", "target": "ATTEMPT-1", "type": "TRIED_ACTION"},
        {"source": "ATTEMPT-1", "target": "OUTCOME-1", "type": "RESULTED_IN"}
      ]
    }
  ],
  "suggested_next_step": "Check account lock status in IAM rather than triggering another reset link.",
  "uncertainty": "The root cause of the authentication failure remains unconfirmed until IAM logs are verified.",
  "is_mock": false,
  "confidence_level": "GROUNDED_HIGH"
}
```

---

### Endpoint 2: Get Customer History Directly from Neo4j
* **Route:** `GET /api/v1/customers/{customer_id}/history`
* **Description:** Returns the raw Neo4j graph nodes and relationship paths for the customer.

#### Response Body (`CustomerHistoryResponse`):
```json
{
  "customer_id": "CUST-1042",
  "total_tickets": 1,
  "tickets": [
    {
      "ticket_id": "T-101",
      "status": "OPEN",
      "created_at": "2026-10-10T14:00:00Z",
      "issue": "Account Login Failure",
      "troubleshooting_attempts": [
        {
          "attempt": "password_reset",
          "outcome": "FAILED",
          "timestamp": "2026-10-10T14:30:00Z"
        }
      ]
    }
  ]
}
```

---

### Endpoint 3: Create / Escalate Ticket
* **Route:** `POST /api/v1/tickets`
* **Description:** Persists a new ticket or troubleshooting attempt back into the Neo4j graph.

#### Request Body (`CreateTicketRequest`):
```json
{
  "customer_id": "CUST-1042",
  "issue": "Account Login Failure - Repeated",
  "attempt": "iam_lock_check",
  "outcome": "IN_PROGRESS",
  "notes": "Escalated from chat session"
}
```

---

## 2. Standard Error Schema (RFC 7807 Compliant)

All HTTP non-2xx responses must return this structure:
```json
{
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "Neo4j cluster connection timed out after 5000ms.",
    "details": "Bolt connection failure on bolt://localhost:7687",
    "retryable": true
  }
}
```

Common error codes:
- `CUSTOMER_NOT_FOUND`: Customer does not exist in the database (frontend handles as empty history).
- `DATABASE_UNAVAILABLE`: Neo4j connection failure (frontend preserves message draft, allows retry).
- `LLM_PROVIDER_ERROR`: External model quota/timeout failure.
- `VALIDATION_ERROR`: Missing required payload fields.

---

## 3. Grounding Guarantees
1. `evidence` array in `/api/v1/chat` response contains **only** records returned by Cypher query.
2. `graph_paths` contains truthful nodes and edges retrieved from Neo4j, never synthesized nodes.
3. If no tickets exist, `evidence` and `graph_paths` are empty lists `[]`.
