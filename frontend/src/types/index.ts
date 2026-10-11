export type OutcomeType = "FAILED" | "RESOLVED" | "IN_PROGRESS" | "ABANDONED" | "UNKNOWN";

export type ConfidenceLevel = "GROUNDED_HIGH" | "LIMITED_EVIDENCE" | "NO_HISTORY" | "UNCONFIRMED";

export interface GraphNode {
  id: string;
  type: "Customer" | "Ticket" | "Issue" | "Attempt" | "Outcome" | "Recommendation" | string;
  label: string;
}

export interface GraphRelationship {
  source: string;
  target: string;
  type: string;
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface EvidenceItem {
  ticket_id: string;
  issue?: string;
  attempt: string;
  outcome: OutcomeType;
  timestamp?: string;
  notes?: string;
}

export interface ChatResponse {
  answer: string;
  evidence: EvidenceItem[];
  graph_paths: GraphPath[];
  suggested_next_step: string;
  uncertainty: string;
  is_mock: boolean;
  confidence_level: ConfidenceLevel;
}

export interface Message {
  id: string;
  sender: "customer" | "assistant" | "system";
  text: string;
  timestamp: string;
  evidence?: EvidenceItem[];
  graphPaths?: GraphPath[];
  suggestedNextStep?: string;
  uncertainty?: string;
  isMock?: boolean;
  confidenceLevel?: ConfidenceLevel;
  error?: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  tier: "Standard" | "Premium" | "Enterprise";
  scenarioLabel?: string;
  description?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}
