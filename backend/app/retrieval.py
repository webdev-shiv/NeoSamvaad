import logging
import uuid
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    from app.neo4j_client import Neo4jClient, get_neo4j_client
    from app.schemas import TicketHistoryItem, AttemptHistoryItem, EvidenceItem
except ImportError:
    from .neo4j_client import Neo4jClient, get_neo4j_client
    from .schemas import TicketHistoryItem, AttemptHistoryItem, EvidenceItem

logger = logging.getLogger("retrieval")

# Grounded Multi-Hop Cypher Retrieval Query
# Uses parameterized customer_id with case-insensitive matching and multi-hop traversal:
# Customer -> Ticket -> Product / Issue / Attempt -> Resolution.
HISTORY_RETRIEVAL_QUERY = """
MATCH (c:Customer)
WHERE c.customer_id = $customer_id OR toLower(c.customer_id) = toLower($customer_id)
MATCH (c)-[:REPORTED]->(t:Ticket)
OPTIONAL MATCH (t)-[:INVOLVES]->(p:Product)
OPTIONAL MATCH (t)-[:CONCERNS]->(i:Issue)
OPTIONAL MATCH (t)-[:HAS_ATTEMPT]->(a:Attempt)
OPTIONAL MATCH (a)-[:RESULTED_IN]->(r:Resolution)
WITH t, p, i, a, r
ORDER BY coalesce(a.timestamp, t.created_at) ASC
WITH t,
     p,
     i,
     collect(
       CASE WHEN a IS NULL THEN null ELSE {
         attempt_id: a.attempt_id,
         method: a.method,
         outcome: a.outcome,
         timestamp: a.timestamp,
         notes: a.notes,
         resolution_action: r.action,
         resolution_status: r.status
       } END
     ) AS raw_attempts
WITH t,
     head(collect(DISTINCT p)) AS p,
     head(collect(DISTINCT i)) AS i,
     [att IN raw_attempts WHERE att IS NOT NULL] AS attempts
ORDER BY coalesce(t.created_at, "") DESC
RETURN
  t.ticket_id AS ticket_id,
  t.status AS ticket_status,
  t.created_at AS created_at,
  p.product_id AS product_id,
  p.name AS product_name,
  i.issue_id AS issue_id,
  i.category AS issue_category,
  i.description AS issue_description,
  attempts
LIMIT $limit;
"""

TICKET_CREATION_QUERY = """
MERGE (c:Customer {customer_id: $customer_id})
ON CREATE SET c.display_name = $customer_id
MERGE (p:Product {product_id: $product_id})
ON CREATE SET p.name = $product_id
MERGE (c)-[:USES]->(p)
MERGE (i:Issue {issue_id: $issue_id})
ON CREATE SET i.category = $category,
              i.description = $issue_description,
              i.normalized_key = $normalized_key
CREATE (t:Ticket {
  ticket_id: $ticket_id,
  status: $status,
  created_at: $created_at,
  updated_at: $created_at
})
CREATE (c)-[:REPORTED]->(t)
CREATE (t)-[:CONCERNS]->(i)
CREATE (t)-[:INVOLVES]->(p)
RETURN
  t.ticket_id AS ticket_id,
  t.status AS status,
  t.created_at AS created_at,
  i.issue_id AS issue_id,
  p.product_id AS product_id,
  c.customer_id AS customer_id;
"""


class CustomerHistoryRetriever:
    """Handles parameterized history retrieval and ticket writes in Neo4j."""

    def __init__(self, client: Optional[Neo4jClient] = None):
        self.client = client or get_neo4j_client()

    def get_customer_history(self, customer_id: str, limit: int = 5) -> List[TicketHistoryItem]:
        """
        Retrieve structured ticket and troubleshooting history for a customer.
        Always parameterized by customer_id.
        """
        clean_cid = str(customer_id).strip()
        if not clean_cid:
            return []

        try:
            records = self.client.execute_query(
                HISTORY_RETRIEVAL_QUERY,
                parameters={"customer_id": clean_cid, "limit": limit},
            )
        except Exception as e:
            logger.error(f"Error querying Neo4j history for customer {clean_cid}: {e}")
            raise

        items: List[TicketHistoryItem] = []
        for rec in records:
            raw_attempts = rec.get("attempts", []) or []
            attempts = [
                AttemptHistoryItem(
                    attempt_id=att.get("attempt_id"),
                    method=att.get("method"),
                    outcome=att.get("outcome"),
                    timestamp=att.get("timestamp"),
                    notes=att.get("notes"),
                    resolution_action=att.get("resolution_action"),
                    resolution_status=att.get("resolution_status"),
                )
                for att in raw_attempts
                if isinstance(att, dict) and (att.get("attempt_id") or att.get("method") or att.get("outcome"))
            ]

            items.append(
                TicketHistoryItem(
                    ticket_id=rec.get("ticket_id"),
                    ticket_status=rec.get("ticket_status"),
                    created_at=rec.get("created_at"),
                    product_id=rec.get("product_id"),
                    product_name=rec.get("product_name"),
                    issue_id=rec.get("issue_id"),
                    issue_category=rec.get("issue_category"),
                    issue_description=rec.get("issue_description"),
                    attempts=attempts,
                )
            )
        return items

    def create_ticket(
        self,
        customer_id: str,
        product_id: str,
        issue_description: str,
        category: str,
    ) -> Dict[str, Any]:
        """
        Create a support ticket, associating customer, product, and normalized issue.
        Avoids creating duplicate nodes for customer, product, or issue where applicable.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        short_id = uuid.uuid4().hex[:6].upper()
        ticket_id = f"T-{short_id}"

        # Normalized key for issue
        clean_cat = re.sub(r"[^a-zA-Z0-9_]+", "_", category.lower()).strip("_")
        normalized_key = f"{clean_cat}_{abs(hash(issue_description.strip().lower())) % 100000}"
        issue_id = f"I-{normalized_key.upper()[:16]}"

        params = {
            "customer_id": customer_id.strip(),
            "product_id": product_id.strip(),
            "ticket_id": ticket_id,
            "issue_id": issue_id,
            "category": category.strip(),
            "issue_description": issue_description.strip(),
            "normalized_key": normalized_key,
            "status": "OPEN",
            "created_at": now_iso,
        }

        try:
            records = self.client.execute_write(TICKET_CREATION_QUERY, parameters=params)
            if not records:
                raise RuntimeError("Failed to create ticket node in Neo4j.")
            return records[0]
        except Exception as e:
            logger.error(f"Error creating ticket in Neo4j: {e}")
            raise

    def create_issue_workflow(
        self,
        customer_id: str,
        product_id: str,
        issue_description: str,
        category: str = "login_failure",
        attempt_method: str = "password_reset",
        attempt_outcome: str = "FAILED",
        attempt_notes: str = "Troubleshooting attempted but error persists",
        resolution_status: str = "UNRESOLVED",
    ) -> Dict[str, Any]:
        """
        Record a full end-to-end issue workflow:
        Customer -> Product -> Issue -> Ticket -> Attempt (FAILED) -> Resolution (UNRESOLVED).
        Directly satisfies the minimum demo requirement: Report issue -> Store in Neo4j.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        short_id = uuid.uuid4().hex[:6].upper()
        ticket_id = f"T-{short_id}"
        attempt_id = f"A-{short_id}-1"
        resolution_id = f"R-{short_id}-1"

        clean_cat = re.sub(r"[^a-zA-Z0-9_]+", "_", category.lower()).strip("_")
        normalized_key = f"{clean_cat}_{abs(hash(issue_description.strip().lower())) % 100000}"
        issue_id = f"I-{normalized_key.upper()[:16]}"

        workflow_query = """
        MERGE (c:Customer {customer_id: $customer_id})
        ON CREATE SET c.display_name = $customer_id
        MERGE (p:Product {product_id: $product_id})
        ON CREATE SET p.name = $product_id
        MERGE (c)-[:USES]->(p)
        MERGE (i:Issue {issue_id: $issue_id})
        ON CREATE SET i.category = $category,
                      i.description = $issue_description,
                      i.normalized_key = $normalized_key
        CREATE (t:Ticket {
          ticket_id: $ticket_id,
          status: "OPEN",
          created_at: $created_at,
          updated_at: $created_at
        })
        CREATE (c)-[:REPORTED]->(t)
        CREATE (t)-[:CONCERNS]->(i)
        CREATE (t)-[:INVOLVES]->(p)
        CREATE (a:Attempt {
          attempt_id: $attempt_id,
          method: $attempt_method,
          outcome: $attempt_outcome,
          notes: $attempt_notes,
          timestamp: $created_at
        })
        CREATE (t)-[:HAS_ATTEMPT]->(a)
        CREATE (r:Resolution {
          resolution_id: $resolution_id,
          status: $resolution_status,
          recorded_at: $created_at
        })
        CREATE (a)-[:RESULTED_IN]->(r)
        RETURN
          t.ticket_id AS ticket_id,
          c.customer_id AS customer_id,
          p.product_id AS product_id,
          i.issue_id AS issue_id,
          a.attempt_id AS attempt_id,
          r.resolution_id AS resolution_id,
          t.status AS status,
          a.outcome AS outcome,
          t.created_at AS created_at;
        """

        params = {
            "customer_id": customer_id.strip(),
            "product_id": product_id.strip(),
            "ticket_id": ticket_id,
            "issue_id": issue_id,
            "category": category.strip(),
            "issue_description": issue_description.strip(),
            "normalized_key": normalized_key,
            "attempt_id": attempt_id,
            "attempt_method": attempt_method.strip(),
            "attempt_outcome": attempt_outcome.strip().upper(),
            "attempt_notes": attempt_notes.strip(),
            "resolution_id": resolution_id,
            "resolution_status": resolution_status.strip().upper(),
            "created_at": now_iso,
        }

        try:
            records = self.client.execute_write(workflow_query, parameters=params)
            if not records:
                raise RuntimeError("Failed to persist full issue workflow in Neo4j.")
            return records[0]
        except Exception as e:
            logger.error(f"Error persisting full issue workflow in Neo4j: {e}")
            raise

    def get_live_graph(self, limit: int = 60) -> Dict[str, Any]:
        """
        Query the active Neo4j AuraDB graph and format nodes and edges for the live visualization.
        """
        query = """
        MATCH (c:Customer)
        OPTIONAL MATCH (c)-[:USES]->(p:Product)
        OPTIONAL MATCH (c)-[:REPORTED]->(t:Ticket)
        OPTIONAL MATCH (t)-[:CONCERNS]->(i:Issue)
        OPTIONAL MATCH (t)-[:INVOLVES]->(tp:Product)
        OPTIONAL MATCH (t)-[:HAS_ATTEMPT]->(a:Attempt)
        OPTIONAL MATCH (a)-[:RESULTED_IN]->(r:Resolution)
        RETURN c, p, t, i, tp, a, r
        LIMIT $limit
        """
        records = self.client.execute_query(query, parameters={"limit": limit})

        node_map: Dict[str, Dict[str, Any]] = {}
        edge_set = set()
        edges: List[Dict[str, str]] = []

        node_colors = {
            "Customer": "#4069E1",
            "Ticket": "#7B5CE6",
            "Issue": "#F4A825",
            "Product": "#10808E",
            "Attempt": "#E26150",
            "Resolution": "#007E14",
        }

        def add_node(node_dict, node_type, id_key, label_key):
            if not node_dict:
                return None
            node_id = str(node_dict.get(id_key) or node_dict.get("id") or "")
            if not node_id:
                return None
            if node_id not in node_map:
                label_val = str(node_dict.get(label_key) or node_dict.get("name") or node_id)
                node_map[node_id] = {
                    "id": node_id,
                    "label": label_val,
                    "type": node_type,
                    "color": node_colors.get(node_type, "#8A90A0"),
                    "properties": dict(node_dict),
                }
            return node_id

        def add_edge(src, tgt, edge_type):
            if not src or not tgt:
                return
            edge_key = f"{src}->{tgt}:{edge_type}"
            if edge_key not in edge_set:
                edge_set.add(edge_key)
                edges.append({
                    "id": f"e-{len(edges) + 1}",
                    "source": src,
                    "target": tgt,
                    "type": edge_type,
                })

        for row in records:
            cid = add_node(row.get("c"), "Customer", "customer_id", "display_name")
            pid = add_node(row.get("p"), "Product", "product_id", "name")
            tid = add_node(row.get("t"), "Ticket", "ticket_id", "ticket_id")
            iid = add_node(row.get("i"), "Issue", "issue_id", "category")
            tpid = add_node(row.get("tp"), "Product", "product_id", "name")
            aid = add_node(row.get("a"), "Attempt", "attempt_id", "method")
            rid = add_node(row.get("r"), "Resolution", "resolution_id", "status")

            if cid and pid:
                add_edge(cid, pid, "USES")
            if cid and tid:
                add_edge(cid, tid, "REPORTED")
            if tid and iid:
                add_edge(tid, iid, "CONCERNS")
            if tid and (tpid or pid):
                add_edge(tid, tpid or pid, "INVOLVES")
            if tid and aid:
                add_edge(tid, aid, "HAS_ATTEMPT")
            if aid and rid:
                add_edge(aid, rid, "RESULTED_IN")

        return {
            "nodes": list(node_map.values()),
            "edges": edges,
            "total_nodes": len(node_map),
            "total_edges": len(edges),
            "neo4j_connected": True,
        }

    @staticmethod
    def extract_evidence(history: List[TicketHistoryItem]) -> List[EvidenceItem]:
        """Extract recorded attempts and outcomes to display as verifiable evidence."""
        evidence: List[EvidenceItem] = []
        for item in history:
            for att in item.attempts:
                if att.method and att.outcome:
                    evidence.append(
                        EvidenceItem(
                            ticket_id=item.ticket_id,
                            attempt=att.method,
                            outcome=att.outcome,
                        )
                    )
        return evidence
