import React from "react";
import type { GraphPath as GraphPathType, EvidenceItem } from "../types";
import { ArrowDown } from "lucide-react";

interface StepItem {
  label: string;
  type: string;
  isOutcome?: boolean;
  isFailed?: boolean;
}

interface GraphPathProps {
  graphPaths?: GraphPathType[];
  evidence?: EvidenceItem[];
  suggestedNextStep?: string;
}

export const GraphPath: React.FC<GraphPathProps> = ({ graphPaths, evidence, suggestedNextStep }) => {
  // If specific Neo4j graph path objects were supplied by backend
  if (graphPaths && graphPaths.length > 0) {
    const path = graphPaths[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px 0" }}>
        {path.nodes.map((node, index) => {
          const isLast = index === path.nodes.length - 1;
          const isOutcome = node.type.toLowerCase() === "outcome";
          const isFailed = node.label.includes("FAILED");

          return (
            <React.Fragment key={node.id || index}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  backgroundColor: isOutcome
                    ? isFailed
                      ? "var(--status-failed-bg)"
                      : "var(--status-resolved-bg)"
                    : "var(--bg-surface-elevated)",
                  border: isOutcome
                    ? isFailed
                      ? "1px solid var(--status-failed-border)"
                      : "1px solid var(--status-resolved-border)"
                    : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--accent-blue)",
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                    {node.type}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)" }}>
                    {node.label}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div style={{ display: "flex", justifyContent: "center", color: "var(--text-dim)" }}>
                  <ArrowDown size={14} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Truthful fallback constructed ONLY from actual evidence
  if (evidence && evidence.length > 0) {
    const item = evidence[0];
    const steps: StepItem[] = [
      { label: `Ticket ${item.ticket_id}`, type: "Previous Ticket" },
      { label: item.issue || "Recorded Issue", type: "Recorded Issue" },
      { label: item.attempt.replace(/_/g, " "), type: "Troubleshooting Attempt" },
      { label: item.outcome, type: "Recorded Outcome", isOutcome: true, isFailed: item.outcome === "FAILED" },
    ];

    if (suggestedNextStep) {
      steps.push({ label: suggestedNextStep, type: "Current Recommendation", isOutcome: false, isFailed: false });
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px 0" }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <React.Fragment key={index}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  backgroundColor: step.isOutcome
                    ? step.isFailed
                      ? "var(--status-failed-bg)"
                      : "var(--status-resolved-bg)"
                    : "var(--bg-surface-elevated)",
                  border: step.isOutcome
                    ? step.isFailed
                      ? "1px solid var(--status-failed-border)"
                      : "1px solid var(--status-resolved-border)"
                    : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--accent-blue)",
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
                    {step.type}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)" }}>
                    {step.label}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div style={{ display: "flex", justifyContent: "center", color: "var(--text-dim)" }}>
                  <ArrowDown size={14} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-primary)",
        border: "1px dashed var(--border-subtle)",
        textAlign: "center",
        color: "var(--text-dim)",
        fontSize: "12px",
      }}
    >
      No graph relationships retrieved for this query.
    </div>
  );
};
