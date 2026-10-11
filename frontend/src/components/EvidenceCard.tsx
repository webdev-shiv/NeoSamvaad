import { useState } from "react";
import type { EvidenceItem } from "../types";
import { AlertCircle, CheckCircle, Clock, FileText, CornerDownRight, Copy, Check } from "lucide-react";

interface EvidenceCardProps {
  item: EvidenceItem;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item }) => {
  const [copied, setCopied] = useState(false);
  const isFailed = item.outcome === "FAILED";
  const isResolved = item.outcome === "RESOLVED";

  const getOutcomeStyle = () => {
    if (isFailed) {
      return {
        bg: "var(--status-failed-bg)",
        border: "var(--status-failed-border)",
        text: "var(--status-failed-text)",
        icon: <AlertCircle size={13} />,
      };
    }
    if (isResolved) {
      return {
        bg: "var(--status-resolved-bg)",
        border: "var(--status-resolved-border)",
        text: "var(--status-resolved-text)",
        icon: <CheckCircle size={13} />,
      };
    }
    return {
      bg: "var(--status-progress-bg)",
      border: "var(--status-progress-border)",
      text: "var(--status-progress-text)",
      icon: <Clock size={13} />,
    };
  };

  const style = getOutcomeStyle();

  const handleCopy = () => {
    navigator.clipboard.writeText(item.ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      style={{
        backgroundColor: "var(--bg-surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "14px",
        marginBottom: "10px",
        boxShadow: "var(--shadow-sm)",
        transition: "border-color 0.15s ease",
      }}
      aria-labelledby={`evidence-title-${item.ticket_id}`}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <FileText size={16} color="var(--accent-primary)" />
          <span id={`evidence-title-${item.ticket_id}`} style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
            Ticket {item.ticket_id}
          </span>
          <button
            onClick={handleCopy}
            title="Copy ticket ID"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          </button>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            color: style.text,
            letterSpacing: "0.03em",
          }}
        >
          {style.icon}
          {item.outcome}
        </span>
      </div>

      {item.issue && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
          <strong style={{ color: "var(--text-main)" }}>Issue:</strong> {item.issue}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-main)", marginBottom: "8px" }}>
        <CornerDownRight size={14} color="var(--accent-primary)" />
        <span><strong>Action:</strong> {item.attempt.replace(/_/g, " ")}</span>
      </div>

      {item.notes && (
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            backgroundColor: "var(--bg-deep)",
            padding: "7px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "6px",
          }}
        >
          {item.notes}
        </div>
      )}

      {item.timestamp && (
        <div style={{ fontSize: "10.5px", color: "var(--text-dim)", textAlign: "right" }}>
          Recorded: {new Date(item.timestamp).toLocaleString()}
        </div>
      )}
    </article>
  );
};
