from unittest.mock import MagicMock
import pytest

from backend.app.retrieval import CustomerHistoryRetriever
from backend.app.schemas import TicketHistoryItem, AttemptHistoryItem


def test_customer_with_linked_ticket_and_product():
    """Test retrieving history for customer with a linked ticket, product, and issue."""
    mock_client = MagicMock()
    mock_client.execute_query.return_value = [
        {
            "ticket_id": "T-101",
            "ticket_status": "OPEN",
            "created_at": "2026-10-10T09:00:00Z",
            "product_id": "P-LOGIN",
            "product_name": "Auth Service",
            "issue_id": "I-LOGIN-01",
            "issue_category": "login_failure",
            "issue_description": "Unable to log in",
            "attempts": [],
        }
    ]

    retriever = CustomerHistoryRetriever(client=mock_client)
    history = retriever.get_customer_history("C-001", limit=5)

    assert len(history) == 1
    item = history[0]
    assert item.ticket_id == "T-101"
    assert item.ticket_status == "OPEN"
    assert item.product_id == "P-LOGIN"
    assert item.product_name == "Auth Service"
    assert item.issue_category == "login_failure"
    assert item.attempts == []

    # Verify parameterized call - query must not have customer_id interpolated
    mock_client.execute_query.assert_called_once()
    args, kwargs = mock_client.execute_query.call_args
    assert "C-001" not in args[0]
    assert kwargs["parameters"]["customer_id"] == "C-001"
    assert kwargs["parameters"]["limit"] == 5


def test_ticket_with_linked_attempts_and_resolutions():
    """Test ticket with multiple troubleshooting attempts and linked resolutions."""
    mock_client = MagicMock()
    mock_client.execute_query.return_value = [
        {
            "ticket_id": "T-101",
            "ticket_status": "OPEN",
            "created_at": "2026-10-10T09:00:00Z",
            "product_id": "P-LOGIN",
            "product_name": "Auth Service",
            "issue_id": "I-LOGIN-01",
            "issue_category": "login_failure",
            "issue_description": "Unable to log in",
            "attempts": [
                {
                    "attempt_id": "A-101-1",
                    "method": "password_reset",
                    "outcome": "FAILED",
                    "timestamp": "2026-10-10T09:15:00Z",
                    "notes": "Reset token expired",
                    "resolution_action": "issue_unresolved",
                    "resolution_status": "UNRESOLVED",
                },
                {
                    "attempt_id": "A-101-2",
                    "method": "clear_session",
                    "outcome": "FAILED",
                    "timestamp": "2026-10-10T09:25:00Z",
                    "notes": "Session was cleared but user still blocked",
                    "resolution_action": "escalated",
                    "resolution_status": "ESCALATED",
                },
            ],
        }
    ]

    retriever = CustomerHistoryRetriever(client=mock_client)
    history = retriever.get_customer_history("C-001")

    assert len(history) == 1
    item = history[0]
    assert item.ticket_status == "OPEN"
    assert len(item.attempts) == 2
    assert item.attempts[0].attempt_id == "A-101-1"
    assert item.attempts[0].method == "password_reset"
    assert item.attempts[0].outcome == "FAILED"
    assert item.attempts[0].notes == "Reset token expired"
    assert item.attempts[0].resolution_action == "issue_unresolved"

    assert item.attempts[1].attempt_id == "A-101-2"
    assert item.attempts[1].method == "clear_session"
    assert item.attempts[1].outcome == "FAILED"
    assert item.attempts[1].resolution_status == "ESCALATED"

    # Verify extracted evidence
    evidence = retriever.extract_evidence(history)
    assert len(evidence) == 2
    assert evidence[0].attempt == "password_reset"
    assert evidence[0].outcome == "FAILED"
    assert evidence[1].attempt == "clear_session"
    assert evidence[1].outcome == "FAILED"


def test_customer_with_no_tickets():
    """Test customer who exists but has no tickets returns empty list."""
    mock_client = MagicMock()
    mock_client.execute_query.return_value = []

    retriever = CustomerHistoryRetriever(client=mock_client)
    history = retriever.get_customer_history("C-NOTICKETS")

    assert history == []
    evidence = retriever.extract_evidence(history)
    assert evidence == []


def test_unknown_customer_returns_empty_list():
    """Test unknown customer returns empty list without error or hallucinated records."""
    mock_client = MagicMock()
    mock_client.execute_query.return_value = []

    retriever = CustomerHistoryRetriever(client=mock_client)
    history = retriever.get_customer_history("UNKNOWN-999")

    assert history == []
    evidence = retriever.extract_evidence(history)
    assert evidence == []


def test_whitespace_and_empty_customer_id():
    """Test whitespace customer_id returns empty without executing query."""
    mock_client = MagicMock()
    retriever = CustomerHistoryRetriever(client=mock_client)

    assert retriever.get_customer_history("") == []
    assert retriever.get_customer_history("   ") == []
    mock_client.execute_query.assert_not_called()


def test_ticket_creation_parameterized():
    """Test ticket creation utilizes parameterized writes."""
    mock_client = MagicMock()
    mock_client.execute_write.return_value = [
        {
            "ticket_id": "T-TEST",
            "status": "OPEN",
            "created_at": "2026-10-11T12:00:00Z",
            "issue_id": "I-LOGIN",
            "product_id": "P-LOGIN",
            "customer_id": "C-001",
        }
    ]

    retriever = CustomerHistoryRetriever(client=mock_client)
    res = retriever.create_ticket(
        customer_id="C-001",
        product_id="P-LOGIN",
        issue_description="Cannot log in",
        category="login_failure",
    )

    assert res["ticket_id"] == "T-TEST"
    assert res["customer_id"] == "C-001"
    mock_client.execute_write.assert_called_once()
    args, kwargs = mock_client.execute_write.call_args
    assert "C-001" not in args[0]
    assert kwargs["parameters"]["customer_id"] == "C-001"
    assert kwargs["parameters"]["product_id"] == "P-LOGIN"
