import React from "react";
import type { GraphPath as GraphPathType, EvidenceItem } from "../types";
import { ArrowDown, AlertCircle, CheckCircle, Layers, Sparkles } from "lucide-react";

interface StepItem {
  label: string;
  type: string;
  relLabel?: string;
  isOutcome?: boolean;
  isFailed?: boolean;
  isRecommendation?: boolean;
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
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px 0" }}>
        {path.nodes.map((node, index) => {
          const isLast = index === path.nodes.length - 1;
          const isOutcome = node.type.toLowerCase() === "outcome";
          const isFailed = node.label.includes("FAILED");
          const rel = path.relationships[index];

          return (
            <React.Fragment key={node.id || index}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: isOutcome
                    ? isFailed
                      ? "var(--status-failed-bg)"
                      : "var(--status-resolved-bg)"
                    : "var(--color-surface-background)",
                  border: isOutcome
                    ? isFailed
                      ? "1px solid var(--status-failed-border)"
                      : "1px solid var(--status-resolved-border)"
                    : "1px solid var(--color-neutral-divider)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: isOutcome
                      ? isFailed
                        ? "var(--color-state-error-light)"
                        : "var(--color-state-success-light)"
                      : "var(--color-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: isOutcome
                      ? isFailed
                        ? "var(--color-state-error)"
                        : "var(--color-state-success)"
                      : "var(--color-primary)",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--color-text-placeholder)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    {node.type}
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {node.label}
                  </div>
                </div>
                {isOutcome && (
                  <div>
                    {isFailed ? <AlertCircle size={16} color="var(--color-state-error)" /> : <CheckCircle size={16} color="var(--color-state-success)" />}
                  </div>
                )}
              </div>

              {!isLast && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "4px 0", color: "var(--color-neutral-icon)" }}>
                  <ArrowDown size={13} />
                  {rel && (
                    <span style={{ fontSize: "9.5px", fontFamily: "monospace", color: "var(--color-accent-4)", backgroundColor: "var(--color-accent-4-light)", padding: "1px 6px", borderRadius: "3px" }}>
                      :{rel.type}
                    </span>
                  )}
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
      { label: `Ticket ${item.ticket_id}`, type: "Previous Ticket", relLabel: "HAS_ISSUE" },
      { label: item.issue || "Recorded Issue", type: "Recorded Issue", relLabel: "TRIED_ACTION" },
      { label: item.attempt.replace(/_/g, " "), type: "Troubleshooting Attempt", relLabel: "RESULTED_IN" },
      { label: item.outcome, type: "Recorded Outcome", relLabel: "LEADS_TO", isOutcome: true, isFailed: item.outcome === "FAILED" },
    ];

    if (suggestedNextStep) {
      steps.push({ label: suggestedNextStep, type: "Current Recommendation", isRecommendation: true });
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px 0" }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <React.Fragment key={index}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: step.isRecommendation
                    ? "var(--color-primary-light)"
                    : step.isOutcome
                    ? step.isFailed
                      ? "var(--status-failed-bg)"
                      : "var(--status-resolved-bg)"
                    : "var(--color-surface-background)",
                  border: step.isRecommendation
                    ? "1.5px solid var(--color-primary)"
                    : step.isOutcome
                    ? step.isFailed
                      ? "1px solid var(--status-failed-border)"
                      : "1px solid var(--status-resolved-border)"
                    : "1px solid var(--color-neutral-divider)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: step.isRecommendation ? "0 2px 10px rgba(64, 105, 225, 0.16)" : "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: step.isRecommendation
                      ? "var(--color-primary)"
                      : step.isOutcome
                      ? step.isFailed
                        ? "var(--color-state-error-light)"
                        : "var(--color-state-success-light)"
                      : "var(--color-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: step.isRecommendation
                      ? "#ffffff"
                      : step.isOutcome
                      ? step.isFailed
                        ? "var(--color-state-error)"
                        : "var(--color-state-success)"
                      : "var(--color-primary)",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: step.isRecommendation ? "var(--color-primary)" : "var(--color-text-placeholder)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    {step.type}
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {step.label}
                  </div>
                </div>
                {step.isOutcome && (
                  <div>
                    {step.isFailed ? <AlertCircle size={16} color="var(--color-state-error)" /> : <CheckCircle size={16} color="var(--color-state-success)" />}
                  </div>
                )}
                {step.isRecommendation && <Sparkles size={16} color="var(--color-primary)" />}
              </div>

              {!isLast && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "4px 0", color: "var(--color-neutral-icon)" }}>
                  <ArrowDown size={13} />
                  {step.relLabel && (
                    <span style={{ fontSize: "9.5px", fontFamily: "monospace", color: "var(--color-accent-4)", backgroundColor: "var(--color-accent-4-light)", padding: "1px 6px", borderRadius: "3px" }}>
                      :{step.relLabel}
                    </span>
                  )}
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
        padding: "20px 16px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-surface-background)",
        border: "1px dashed var(--color-neutral-border)",
        textAlign: "center",
        color: "var(--color-text-placeholder)",
        fontSize: "12px",
      }}
    >
      <Layers size={22} color="var(--color-neutral-icon)" style={{ marginBottom: "6px" }} />
      <div>No graph relationships retrieved for this customer.</div>
    </div>
  );
};
