import type { CustomerProfile, ChatResponse } from "../types";

export const DEMO_CUSTOMERS: CustomerProfile[] = [
  {
    id: "C-001",
    name: "Alice Johnson (Scenario A)",
    tier: "Premium",
    scenarioLabel: "Scenario A: Failed Attempt",
    description: "Previous password reset attempt on ticket T-101 failed.",
  },
  {
    id: "C-002",
    name: "Bob Smith (Scenario B)",
    tier: "Standard",
    scenarioLabel: "Scenario B: Contrast Resolved Case",
    description: "Has resolved billing invoice ticket T-201 with successful browser cache clear.",
  },
  {
    id: "C-003",
    name: "Charlie Brown (Scenario C)",
    tier: "Standard",
    scenarioLabel: "Scenario C: New Customer",
    description: "Brand new user with empty historical graph records.",
  },
  {
    id: "CUST-1042",
    name: "Alice Smith (CUST-1042)",
    tier: "Premium",
    scenarioLabel: "Scenario A: Failed Attempt",
    description: "Previous password reset attempt on ticket T-101 failed.",
  },
  {
    id: "CUST-2055",
    name: "Bob Jenkins (Scenario B)",
    tier: "Standard",
    scenarioLabel: "Scenario B: Missing Evidence",
    description: "Has billing ticket T-204, but no server cache clear record.",
  },
  {
    id: "CUST-4040",
    name: "David Miller (Scenario D)",
    tier: "Enterprise",
    scenarioLabel: "Scenario D: Backend Error",
    description: "Simulates Neo4j cluster disconnection or network timeout.",
  },
  {
    id: "CUST-5012",
    name: "Eve Black (Scenario E)",
    tier: "Standard",
    scenarioLabel: "Scenario E: Untrusted Input",
    description: "Tests prompt injection and containment of system rules.",
  },
];

export function getMockResponseForCustomer(customerId: string, userMessage: string): ChatResponse {
  const msg = userMessage.toLowerCase();

  // Scenario D: Simulated backend error
  if (customerId === "CUST-4040" || msg.includes("simulate_error")) {
    throw new Error("DATABASE_UNAVAILABLE: Neo4j Bolt cluster connection timed out after 5000ms.");
  }

  // Scenario E: Untrusted input / injection attack
  if (customerId === "CUST-5012" || msg.includes("ignore previous") || msg.includes("system prompt") || msg.includes("other customer")) {
    return {
      answer: "I am a secure customer support assistant. I cannot disclose internal system instructions or other customers' records. I am only authorized to assist with your verified account.",
      evidence: [],
      graph_paths: [],
      suggested_next_step: "Please submit inquiries regarding your authorized account services only.",
      uncertainty: "Input contained unauthorized administrative instructions.",
      is_mock: true,
      confidence_level: "UNCONFIRMED",
    };
  }

  // Scenario C: New customer (empty history)
  if (customerId === "C-003" || customerId === "CUST-3099") {
    return {
      answer: `Welcome to support! No historical support records are available for your account (${customerId}). Based on your request, I will guide you through getting your account configured properly.`,
      evidence: [],
      graph_paths: [],
      suggested_next_step: "Please share the specific error message or onboarding step you are encountering.",
      uncertainty: "Zero historical records exist in the knowledge graph for this customer.",
      is_mock: true,
      confidence_level: "NO_HISTORY",
    };
  }

  // Scenario B: Missing specific historical evidence or resolved contrast
  if (customerId === "C-002" || customerId === "CUST-2055" || msg.includes("session cache") || msg.includes("cache")) {
    return {
      answer: "According to your recorded history for ticket T-204, our only documented action was an 'invoice_reissue'. The specific cache-clear action you asked about cannot be confirmed from our available knowledge graph records.",
      evidence: [
        {
          ticket_id: "T-204",
          issue: "Billing Portal Sync",
          attempt: "invoice_reissue",
          outcome: "RESOLVED",
          timestamp: "2026-10-09T11:15:00Z",
          notes: "Invoice PDF refreshed successfully.",
        },
      ],
      graph_paths: [
        {
          nodes: [
            { id: "CUST-2055", type: "Customer", label: "Bob Jenkins" },
            { id: "T-204", type: "Ticket", label: "Ticket T-204" },
            { id: "ISSUE-2", type: "Issue", label: "Billing Portal Sync" },
            { id: "ATTEMPT-2", type: "Attempt", label: "Invoice Reissue" },
            { id: "OUTCOME-2", type: "Outcome", label: "RESOLVED" },
          ],
          relationships: [
            { source: "CUST-2055", target: "T-204", type: "HAS_TICKET" },
            { source: "T-204", target: "ISSUE-2", type: "REGARDS_ISSUE" },
            { source: "ISSUE-2", target: "ATTEMPT-2", type: "ACTION_TAKEN" },
            { source: "ATTEMPT-2", target: "OUTCOME-2", type: "RESULTED_IN" },
          ],
        },
      ],
      suggested_next_step: "Verify if the cache clear was executed locally in your browser rather than our portal backend.",
      uncertainty: "Requested troubleshooting attempt is not recorded in the graph database.",
      is_mock: true,
      confidence_level: "LIMITED_EVIDENCE",
    };
  }

  // Scenario A: Default / Failed attempt
  return {
    answer: "I reviewed your records and noticed that a previous password reset attempt for ticket T-101 failed on 2026-10-10. Because that reset did not resolve the issue, rather than repeating another reset link, let's inspect whether your account is locked in IAM.",
    evidence: [
      {
        ticket_id: "T-101",
        issue: "Account Login Failure",
        attempt: "password_reset",
        outcome: "FAILED",
        timestamp: "2026-10-10T14:30:00Z",
        notes: "SMS 2FA token expired before user entered it.",
      },
    ],
    graph_paths: [
      {
        nodes: [
          { id: "CUST-1042", type: "Customer", label: "Alice Smith" },
          { id: "T-101", type: "Ticket", label: "Ticket T-101" },
          { id: "ISSUE-1", type: "Issue", label: "Account Login Failure" },
          { id: "ATTEMPT-1", type: "Attempt", label: "Password Reset" },
          { id: "OUTCOME-1", type: "Outcome", label: "FAILED" },
          { id: "REC-1", type: "Recommendation", label: "Inspect IAM Lock Status" },
        ],
        relationships: [
          { source: "CUST-1042", target: "T-101", type: "HAS_TICKET" },
          { source: "T-101", target: "ISSUE-1", type: "REGARDS_ISSUE" },
          { source: "ISSUE-1", target: "ATTEMPT-1", type: "TRIED_ACTION" },
          { source: "ATTEMPT-1", target: "OUTCOME-1", type: "RESULTED_IN" },
          { source: "OUTCOME-1", target: "REC-1", type: "LEADS_TO" },
        ],
      },
    ],
    suggested_next_step: "Check IAM lock status and unlock the account before requesting a new password token.",
    uncertainty: "Root cause of the authentication failure remains unconfirmed until IAM logs are inspected.",
    is_mock: true,
    confidence_level: "LIMITED_EVIDENCE",
  };
}
