import React from "react";
import type { Message } from "../types";
import { Bot, User, AlertTriangle, ArrowRight } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isCustomer = message.sender === "customer";

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isCustomer ? "flex-end" : "flex-start",
        marginBottom: "16px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          maxWidth: "80%",
          flexDirection: isCustomer ? "row-reverse" : "row",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: isCustomer ? "var(--bg-surface-elevated)" : "rgba(59, 130, 246, 0.15)",
            border: isCustomer ? "1px solid var(--border-subtle)" : "1px solid var(--accent-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isCustomer ? "var(--text-main)" : "var(--accent-blue)",
            flexShrink: 0,
          }}
        >
          {isCustomer ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderRadius: isCustomer
                ? "var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)"
                : "var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
              backgroundColor: isCustomer
                ? "var(--accent-blue)"
                : "var(--bg-surface-elevated)",
              color: isCustomer ? "#ffffff" : "var(--text-main)",
              border: isCustomer ? "none" : "1px solid var(--border-subtle)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              fontSize: "13.5px",
              lineHeight: "1.5",
            }}
          >
            {message.text}
          </div>

          {/* Assistant Metadata Cards */}
          {!isCustomer && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Suggested Next Step */}
              {message.suggestedNextStep && (
                <div
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <ArrowRight size={14} color="var(--accent-blue)" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", display: "block" }}>
                      Suggested Next Step (Avoids Repeating Failed Cycles):
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-main)" }}>
                      {message.suggestedNextStep}
                    </span>
                  </div>
                </div>
              )}

              {/* Uncertainty Notice */}
              {message.uncertainty && (
                <div
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", display: "block" }}>
                      Uncertainty / Missing History Boundary:
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {message.uncertainty}
                    </span>
                  </div>
                </div>
              )}

              {/* Badges for Mock and Citations */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                {message.isMock && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      color: "#f59e0b",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    Mock Fixture Output
                  </span>
                )}
                {message.evidence && message.evidence.length > 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    Backed by {message.evidence.length} Neo4j Record(s)
                  </span>
                )}
                <span style={{ fontSize: "10px", color: "var(--text-dim)", marginLeft: "auto" }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )}

          {/* Error & Retry */}
          {message.error && onRetry && (
            <button
              onClick={onRetry}
              style={{
                alignSelf: "flex-start",
                marginTop: "4px",
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Retry this message
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
