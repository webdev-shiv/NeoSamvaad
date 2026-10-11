import type { EvidenceItem } from "../types";
import { AlertCircle, CheckCircle, Clock, FileText, CornerDownRight } from "lucide-react";

interface EvidenceCardProps {
  item: EvidenceItem;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item }) => {
  const isFailed = item.outcome === "FAILED";
  const isResolved = item.outcome === "RESOLVED";

  const getOutcomeStyle = () => {
    if (isFailed) {
      return {
        bg: "var(--status-failed-bg)",
        border: "var(--status-failed-border)",
        text: "var(--status-failed-text)",
        icon: <AlertCircle size={14} />,
      };
    }
    if (isResolved) {
      return {
        bg: "var(--status-resolved-bg)",
        border: "var(--status-resolved-border)",
        text: "var(--status-resolved-text)",
        icon: <CheckCircle size={14} />,
      };
    }
    return {
      bg: "var(--status-progress-bg)",
      border: "var(--status-progress-border)",
      text: "var(--status-progress-text)",
      icon: <Clock size={14} />,
    };
  };

  const style = getOutcomeStyle();

  return (
    <article
      style={{
        backgroundColor: "var(--bg-surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "12px",
        marginBottom: "10px",
      }}
      aria-labelledby={`evidence-title-${item.ticket_id}`}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FileText size={15} color="var(--accent-blue)" />
          <span id={`evidence-title-${item.ticket_id}`} style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
            Ticket {item.ticket_id}
          </span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            color: style.text,
          }}
        >
          {style.icon}
          {item.outcome}
        </span>
      </div>

      {item.issue && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
          <strong>Issue:</strong> {item.issue}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-main)", marginBottom: "6px" }}>
        <CornerDownRight size={13} color="var(--text-dim)" />
        <span><strong>Action:</strong> {item.attempt.replace(/_/g, " ")}</span>
      </div>

      {item.notes && (
        <div style={{ fontSize: "11px", color: "var(--text-dim)", backgroundColor: "var(--bg-primary)", padding: "6px 8px", borderRadius: "var(--radius-sm)", marginBottom: "6px" }}>
          {item.notes}
        </div>
      )}

      {item.timestamp && (
        <div style={{ fontSize: "10px", color: "var(--text-dim)", textAlign: "right" }}>
          Recorded: {new Date(item.timestamp).toLocaleString()}
        </div>
      )}
    </article>
  );
};
