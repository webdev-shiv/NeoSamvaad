import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <div
      role="alert"
      className="animate-fade-in"
      style={{
        margin: "12px 24px 0",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--status-failed-bg)",
        border: "1px solid var(--status-failed-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <AlertCircle size={18} color="var(--status-failed-text)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--status-failed-text)" }}>
            Backend Communication Notice
          </div>
          <div style={{ fontSize: "12px", color: "#fecaca" }}>
            {message}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              padding: "2px",
            }}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
