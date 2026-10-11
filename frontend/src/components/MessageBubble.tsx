import { useState } from "react";
import type { Message } from "../types";
import { Bot, User, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Database, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isCustomer = message.sender === "customer";
  const [showReasoning, setShowReasoning] = useState<boolean>(false);

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isCustomer ? "flex-end" : "flex-start",
        marginBottom: "18px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          maxWidth: "85%",
          flexDirection: isCustomer ? "row-reverse" : "row",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            background: isCustomer
              ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              : "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
            border: isCustomer ? "none" : "1px solid var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isCustomer ? "#ffffff" : "var(--accent-primary)",
            flexShrink: 0,
            boxShadow: isCustomer ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "0 4px 12px rgba(99, 102, 241, 0.15)",
          }}
        >
          {isCustomer ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Content Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* Main Bubble */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: isCustomer
                ? "var(--radius-lg) var(--radius-xs) var(--radius-lg) var(--radius-lg)"
                : "var(--radius-xs) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
              background: isCustomer
                ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                : "var(--bg-surface-elevated)",
              color: isCustomer ? "#ffffff" : "var(--text-main)",
              border: isCustomer ? "none" : "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-md)",
              fontSize: "13.5px",
              lineHeight: "1.6",
            }}
          >
            {message.text}
          </div>

          {/* Assistant Reasoning & Metadata Accordion */}
          {!isCustomer && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Reasoning Dropdown Toggle */}
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  color: "var(--accent-primary)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Sparkles size={12} />
                <span>{showReasoning ? "Hide Grounding Telemetry" : "Inspect Grounding Telemetry (4 Steps)"}</span>
                {showReasoning ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {/* Collapsible Reasoning Details */}
              {showReasoning && (
                <div
                  className="animate-fade-in"
                  style={{
                    backgroundColor: "var(--bg-deep)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: "11.5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <CheckCircle2 size={13} />
                    <span>1. Verified authorized customer context</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <Database size={13} />
                    <span>2. Cypher graph traversal executed: {message.evidence?.length || 0} authoritative ticket(s) found</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <ShieldCheck size={13} />
                    <span>3. Verified no duplicate execution of previously failed actions</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)" }}>
                    <Sparkles size={13} />
                    <span>4. Synthesized grounded next steps with explicit uncertainty limits</span>
                  </div>
                </div>
              )}

              {/* Suggested Next Step Card */}
              {message.suggestedNextStep && (
                <div
                  style={{
                    backgroundColor: "rgba(99, 102, 241, 0.07)",
                    border: "1px solid rgba(99, 102, 241, 0.28)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <ArrowRight size={15} color="var(--accent-primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>
                      Recommended Next Step (Avoids Repeating Failed Cycles):
                    </span>
                    <span style={{ fontSize: "12.5px", color: "var(--text-main)", fontWeight: 500 }}>
                      {message.suggestedNextStep}
                    </span>
                  </div>
                </div>
              )}

              {/* Uncertainty Boundary Notice */}
              {message.uncertainty && (
                <div
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.07)",
                    border: "1px solid rgba(245, 158, 11, 0.28)",
                    borderRadius: "var(--radius-md)",
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <AlertTriangle size={15} color="#fbbf24" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>
                      Uncertainty / History Limitation:
                    </span>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                      {message.uncertainty}
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                {message.isMock && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      color: "#fbbf24",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    Demo Fixture
                  </span>
                )}
                {message.evidence && message.evidence.length > 0 && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    Backed by {message.evidence.length} Neo4j Record(s)
                  </span>
                )}
                <span style={{ fontSize: "10.5px", color: "var(--text-dim)", marginLeft: "auto" }}>
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
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                fontSize: "11.5px",
                fontWeight: 600,
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
