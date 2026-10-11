// Synthetic Seed Data for Context-Aware Support Agent
// Idempotent MERGE operations to prevent duplicate records on repeated execution

// 1. Products
MERGE (p1:Product {product_id: "P-LOGIN"})
ON CREATE SET p1.name = "Auth & Identity Service";

MERGE (p2:Product {product_id: "P-BILLING"})
ON CREATE SET p2.name = "Billing Portal";

// 2. Customers
MERGE (c1:Customer {customer_id: "C-001"})
ON CREATE SET c1.display_name = "Alice Johnson";

MERGE (c2:Customer {customer_id: "C-002"})
ON CREATE SET c2.display_name = "Bob Smith";

// Customer Product associations
MATCH (c1:Customer {customer_id: "C-001"}), (p1:Product {product_id: "P-LOGIN"})
MERGE (c1)-[:USES]->(p1);

MATCH (c2:Customer {customer_id: "C-002"}), (p2:Product {product_id: "P-BILLING"})
MERGE (c2)-[:USES]->(p2);

// 3. Demo Case 1 (C-001): Failed Password Reset on Login Issue
MERGE (t1:Ticket {ticket_id: "T-101"})
ON CREATE SET 
  t1.status = "OPEN",
  t1.created_at = "2026-10-10T09:00:00Z",
  t1.updated_at = "2026-10-10T09:30:00Z";

MERGE (i1:Issue {issue_id: "I-LOGIN-01"})
ON CREATE SET 
  i1.category = "login_failure",
  i1.description = "Unable to log in to dashboard",
  i1.normalized_key = "login_failure_auth_token";

MERGE (a1:Attempt {attempt_id: "A-101-1"})
ON CREATE SET 
  a1.method = "password_reset",
  a1.outcome = "FAILED",
  a1.timestamp = "2026-10-10T09:15:00Z",
  a1.notes = "Password reset link sent and clicked, but customer still receives invalid session error";

MERGE (r1:Resolution {resolution_id: "R-101-1"})
ON CREATE SET 
  r1.action = "issue_unresolved",
  r1.status = "UNRESOLVED",
  r1.recorded_at = "2026-10-10T09:20:00Z";

MATCH (c1:Customer {customer_id: "C-001"}), (t1:Ticket {ticket_id: "T-101"})
MERGE (c1)-[:REPORTED]->(t1);

MATCH (t1:Ticket {ticket_id: "T-101"}), (i1:Issue {issue_id: "I-LOGIN-01"})
MERGE (t1)-[:CONCERNS]->(i1);

MATCH (t1:Ticket {ticket_id: "T-101"}), (p1:Product {product_id: "P-LOGIN"})
MERGE (t1)-[:INVOLVES]->(p1);

MATCH (t1:Ticket {ticket_id: "T-101"}), (a1:Attempt {attempt_id: "A-101-1"})
MERGE (t1)-[:HAS_ATTEMPT]->(a1);

MATCH (a1:Attempt {attempt_id: "A-101-1"}), (r1:Resolution {resolution_id: "R-101-1"})
MERGE (a1)-[:RESULTED_IN]->(r1);

// 4. Demo Case 2 (C-002): Resolved invoice issue (contrast case)
MERGE (t2:Ticket {ticket_id: "T-201"})
ON CREATE SET 
  t2.status = "RESOLVED",
  t2.created_at = "2026-10-09T14:00:00Z",
  t2.updated_at = "2026-10-09T14:25:00Z";

MERGE (i2:Issue {issue_id: "I-BILL-01"})
ON CREATE SET 
  i2.category = "invoice_download",
  i2.description = "Cannot download monthly invoice PDF",
  i2.normalized_key = "invoice_pdf_download";

MERGE (a2:Attempt {attempt_id: "A-201-1"})
ON CREATE SET 
  a2.method = "clear_browser_cache",
  a2.outcome = "SUCCESS",
  a2.timestamp = "2026-10-09T14:15:00Z",
  a2.notes = "Cleared cached tokens and cookies, PDF downloaded successfully";

MERGE (r2:Resolution {resolution_id: "R-201-1"})
ON CREATE SET 
  r2.action = "invoice_accessed",
  r2.status = "RESOLVED",
  r2.recorded_at = "2026-10-09T14:20:00Z";

MATCH (c2:Customer {customer_id: "C-002"}), (t2:Ticket {ticket_id: "T-201"})
MERGE (c2)-[:REPORTED]->(t2);

MATCH (t2:Ticket {ticket_id: "T-201"}), (i2:Issue {issue_id: "I-BILL-01"})
MERGE (t2)-[:CONCERNS]->(i2);

MATCH (t2:Ticket {ticket_id: "T-201"}), (p2:Product {product_id: "P-BILLING"})
MERGE (t2)-[:INVOLVES]->(p2);

MATCH (t2:Ticket {ticket_id: "T-201"}), (a2:Attempt {attempt_id: "A-201-1"})
MERGE (t2)-[:HAS_ATTEMPT]->(a2);

MATCH (a2:Attempt {attempt_id: "A-201-1"}), (r2:Resolution {resolution_id: "R-201-1"})
MERGE (a2)-[:RESULTED_IN]->(r2);
