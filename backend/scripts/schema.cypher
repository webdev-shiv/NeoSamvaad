// Constraints and indexes for Support Agent Graph
// Ensuring idempotent writes and uniqueness on stable IDs

CREATE CONSTRAINT customer_id_unique IF NOT EXISTS
FOR (c:Customer) REQUIRE c.customer_id IS UNIQUE;

CREATE CONSTRAINT product_id_unique IF NOT EXISTS
FOR (p:Product) REQUIRE p.product_id IS UNIQUE;

CREATE CONSTRAINT issue_id_unique IF NOT EXISTS
FOR (i:Issue) REQUIRE i.issue_id IS UNIQUE;

CREATE CONSTRAINT ticket_id_unique IF NOT EXISTS
FOR (t:Ticket) REQUIRE t.ticket_id IS UNIQUE;

CREATE CONSTRAINT attempt_id_unique IF NOT EXISTS
FOR (a:Attempt) REQUIRE a.attempt_id IS UNIQUE;

CREATE CONSTRAINT resolution_id_unique IF NOT EXISTS
FOR (r:Resolution) REQUIRE r.resolution_id IS UNIQUE;
