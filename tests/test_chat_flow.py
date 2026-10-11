from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import json
import pytest

from backend.app.main import app
from backend.app.schemas import TicketHistoryItem, AttemptHistoryItem

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "neo4j_connected" in data
    assert "llm_configured" in data


def test_chat_with_failed_history_deterministic_fallback():
    mock_history = [
        TicketHistoryItem(
            ticket_id="T-101",
            ticket_status="OPEN",
            created_at="2026-10-10T09:00:00Z",
            issue_id="I-LOGIN-01",
            issue_category="login_failure",
            issue_description="Unable to log in to dashboard",
            attempts=[
                AttemptHistoryItem(
                    attempt_id="A-101-1",
                    method="password_reset",
                    outcome="FAILED",
                    timestamp="2026-10-10T09:15:00Z",
                    resolution_action="issue_unresolved",
                    resolution_status="UNRESOLVED",
                )
            ],
        )
    ]

    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=mock_history), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True), \
         patch("backend.app.config.Settings.is_llm_configured", False):

        response = client.post(
            "/chat",
            json={"customer_id": "C-001", "message": "My account still isn't working."},
        )

        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "evidence" in data
        assert "suggested_next_step" in data
        assert "uncertainty" in data

        # Check evidence references
        assert len(data["evidence"]) >= 1
        ev = data["evidence"][0]
        assert ev["ticket_id"] == "T-101"
        assert ev["attempt"] == "password_reset"
        assert ev["outcome"] == "FAILED"

        # Answer should acknowledge the failed attempt rather than repeating it
        assert "password_reset" in data["answer"] or "FAILED" in data["answer"] or "failed" in data["answer"].lower()
        assert "T-101" in data["answer"]


def test_chat_with_gemini_mocked_success():
    """Verify Gemini SDK generates structured response using retrieved graph evidence."""
    mock_history = [
        TicketHistoryItem(
            ticket_id="T-101",
            ticket_status="OPEN",
            created_at="2026-10-10T09:00:00Z",
            issue_id="I-LOGIN-01",
            issue_category="login_failure",
            issue_description="Unable to log in to dashboard",
            attempts=[
                AttemptHistoryItem(
                    attempt_id="A-101-1",
                    method="password_reset",
                    outcome="FAILED",
                    timestamp="2026-10-10T09:15:00Z",
                    resolution_action="issue_unresolved",
                    resolution_status="UNRESOLVED",
                )
            ],
        )
    ]

    gemini_json_payload = {
        "answer": "Records indicate password_reset failed on ticket T-101. Let us verify identity token status.",
        "evidence": [
            {
                "ticket_id": "T-101",
                "attempt": "password_reset",
                "outcome": "FAILED"
            }
        ],
        "suggested_next_step": "Inspect identity provider session token.",
        "uncertainty": "Live account details unverified by prototype."
    }

    mock_resp = MagicMock()
    mock_resp.text = json.dumps(gemini_json_payload)

    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=mock_history), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True), \
         patch("backend.app.config.Settings.is_llm_configured", True), \
         patch("backend.app.config.Settings.effective_gemini_api_key", "test-mock-key"), \
         patch("google.genai.Client") as mock_client_cls:

        mock_instance = MagicMock()
        mock_instance.models.generate_content.return_value = mock_resp
        mock_client_cls.return_value = mock_instance

        response = client.post(
            "/chat",
            json={"customer_id": "C-001", "message": "Still unable to sign in."},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["answer"] == gemini_json_payload["answer"]
        assert len(data["evidence"]) == 1
        assert data["evidence"][0]["attempt"] == "password_reset"
        assert data["suggested_next_step"] == gemini_json_payload["suggested_next_step"]


def test_chat_gemini_api_error_falls_back():
    """Verify that when Gemini API call raises an exception, the system gracefully falls back."""
    mock_history = [
        TicketHistoryItem(
            ticket_id="T-101",
            ticket_status="OPEN",
            created_at="2026-10-10T09:00:00Z",
            attempts=[
                AttemptHistoryItem(
                    attempt_id="A-101-1",
                    method="password_reset",
                    outcome="FAILED",
                )
            ],
        )
    ]

    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=mock_history), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True), \
         patch("backend.app.config.Settings.is_llm_configured", True), \
         patch("backend.app.config.Settings.effective_gemini_api_key", "test-mock-key"), \
         patch("google.genai.Client", side_effect=RuntimeError("Gemini service timeout")):

        response = client.post(
            "/chat",
            json={"customer_id": "C-001", "message": "Help with login."},
        )

        assert response.status_code == 200
        data = response.json()
        assert "T-101" in data["answer"]
        assert "password_reset" in data["answer"]
        # Verify fallback reason is explicitly surfaced
        assert "Gemini API error" in data["uncertainty"] or "fallback" in data["uncertainty"].lower()


def test_chat_with_unknown_customer_no_history_invention():
    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=[]), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True), \
         patch("backend.app.config.Settings.is_llm_configured", False):

        response = client.post(
            "/chat",
            json={"customer_id": "C-UNKNOWN", "message": "I need help with my service."},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["evidence"] == []
        # Must acknowledge that no prior history was found rather than fabricating attempts
        assert "no prior support history" in data["answer"].lower() or "no previous" in data["answer"].lower()


def test_customer_history_endpoint():
    mock_history = [
        TicketHistoryItem(
            ticket_id="T-101",
            ticket_status="OPEN",
            created_at="2026-10-10T09:00:00Z",
            product_id="P-LOGIN",
            product_name="Auth Service",
            issue_id="I-LOGIN-01",
            issue_category="login_failure",
            issue_description="Unable to log in",
            attempts=[
                AttemptHistoryItem(
                    attempt_id="A-101-1",
                    method="password_reset",
                    outcome="FAILED",
                    timestamp="2026-10-10T09:15:00Z",
                    notes="Expired link",
                    resolution_action="issue_unresolved",
                    resolution_status="UNRESOLVED",
                )
            ],
        )
    ]

    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=mock_history), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True):

        response = client.get("/customers/C-001/history")
        assert response.status_code == 200
        data = response.json()
        assert data["customer_id"] == "C-001"
        assert len(data["history"]) == 1
        t = data["history"][0]
        assert t["ticket_id"] == "T-101"
        assert t["ticket_status"] == "OPEN"
        assert t["product_id"] == "P-LOGIN"
        assert t["product_name"] == "Auth Service"
        assert len(t["attempts"]) == 1
        assert t["attempts"][0]["outcome"] == "FAILED"


def test_customer_history_endpoint_empty_for_unknown():
    with patch("backend.app.retrieval.CustomerHistoryRetriever.get_customer_history", return_value=[]), \
         patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=True):

        response = client.get("/customers/UNKNOWN/history")
        assert response.status_code == 200
        data = response.json()
        assert data["customer_id"] == "UNKNOWN"
        assert data["history"] == []


def test_tickets_endpoint_service_unavailable_when_db_offline():
    with patch("backend.app.neo4j_client.Neo4jClient.verify_connectivity", return_value=False):
        response = client.post(
            "/tickets",
            json={
                "customer_id": "C-001",
                "product_id": "P-LOGIN",
                "issue_description": "Cannot log in",
                "category": "login_failure",
            },
        )
        assert response.status_code == 503
