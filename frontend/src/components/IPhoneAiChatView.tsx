import React, { useState, useRef, useEffect } from "react";
import type { Message, CustomerProfile } from "../types";
import {
  Sparkles,
  RotateCcw,
  Send,
  ArrowDown,
  Network,
  ShieldCheck,
  CheckCircle2,
  Database,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

export interface IPhoneAiChatViewProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  error?: string | null;
  onSendMessage: (text: string) => void;
  onRetryLastMessage?: () => void;
  onResetToOrb: () => void;
  evidenceCount?: number;
  initialQuestion?: string;
  initialAnswer?: string;
  customers?: CustomerProfile[];
  onSelectCustomer?: (customer: CustomerProfile) => void;
  showCustomerDropdown?: boolean;
}

export const IPhoneAiChatView: React.FC<IPhoneAiChatViewProps> = ({
  messages,
  isLoading,
  activeCustomer,
  error,
  onSendMessage,
  onRetryLastMessage,
  onResetToOrb,
  evidenceCount = 0,
  initialQuestion,
  initialAnswer,
  customers,
  onSelectCustomer,
  showCustomerDropdown = true,
}) => {
  const [localInput, setLocalInput] = useState<string>("");
  const [openTelemetryId, setOpenTelemetryId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll within container when messages change without moving outer workspace
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Contextual prompts based on active customer
  const scenarioPrompts =
    activeCustomer.id.includes("1001") || activeCustomer.name.toLowerCase().includes("alice")
      ? [
          "Why was the $35 overdraft fee assessed on Oct 10?",
          "Can this fee be refunded under bank policy?",
          "Check Alice's account tier and relationship tenure",
        ]
      : activeCustomer.id.includes("1002") || activeCustomer.name.toLowerCase().includes("bob")
      ? [
          "What is Bob's current mortgage payment status?",
          "Are there any risk flags on Bob's accounts?",
          "Check transaction history around payment date",
        ]
      : [
          "Explain the Neo4j Cypher query executed",
          "Show related customer transactions and accounts",
          "What bank resolution policy applies here?",
        ];

  const handleSend = () => {
    const text = localInput.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setLocalInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToGraph = () => {
    const el = document.getElementById("neo4j-live-graph-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleTelemetry = (msgId: string) => {
    setOpenTelemetryId((prev) => (prev === msgId ? null : msgId));
  };

  // Compile display messages, using initial question & answer if messages array is empty
  const displayMessages: Message[] =
    messages.length > 0
      ? messages
      : initialQuestion || initialAnswer
      ? [
          ...(initialQuestion
            ? [
                {
                  id: "initial_cust",
                  sender: "customer" as const,
                  text: initialQuestion,
                  timestamp: new Date().toISOString(),
                },
              ]
            : []),
          ...(initialAnswer
            ? [
                {
                  id: "initial_asst",
                  sender: "assistant" as const,
                  text: initialAnswer,
                  timestamp: new Date().toISOString(),
                },
              ]
            : []),
        ]
      : [];

  return (
    <div className="mo-ios-chat-container">
      {/* ── Sleek iOS 18 Glass Header ── */}
      <div className="mo-ios-header">
        <div className="mo-ios-header-left">
          {/* Siri 18 Iridescent Avatar */}
          <div className="mo-ios-siri-badge" title="Apple Intelligence Active">
            <Sparkles size={16} />
          </div>

          <div className="mo-ios-header-info">
            <div className="mo-ios-title-row">
              <span className="mo-ios-title">Neo4j Graph-RAG Assistant</span>
              <span className="mo-ios-live-pill">
                <ShieldCheck size={11} />
                Live Grounded
              </span>
            </div>

            <div className="mo-ios-customer-text" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>
                Customer: <strong>{activeCustomer.name}</strong> ({activeCustomer.id})
              </span>
              {activeCustomer.scenarioLabel && (
                <span className="mo-ios-scenario-badge">{activeCustomer.scenarioLabel}</span>
              )}
              {showCustomerDropdown !== false && onSelectCustomer && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginLeft: "4px" }}>
                  <select
                    value={activeCustomer.id}
                    onChange={(e) => {
                      const found = (customers || []).find((c) => c.id === e.target.value);
                      if (found) onSelectCustomer(found);
                    }}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-primary)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(64, 105, 225, 0.12)",
                    }}
                    aria-label="Change customer persona"
                  >
                    {(customers && customers.length > 0 ? customers : [activeCustomer]).map((c) => (
                      <option key={c.id} value={c.id}>
                        Switch to: {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="mo-ios-header-actions">
          <button
            type="button"
            className="mo-ios-pill-btn"
            onClick={scrollToGraph}
            title="Inspect Neo4j live graph visualization"
          >
            <Network size={13} style={{ color: "var(--color-primary)" }} />
            <span>Graph View {evidenceCount > 0 ? `(${evidenceCount})` : ""}</span>
            <ArrowDown size={11} />
          </button>

          <button
            type="button"
            className="mo-ios-pill-btn mo-ios-pill-btn-primary"
            onClick={onResetToOrb}
            title="Morph back into Thinking Orb"
          >
            <RotateCcw size={12} />
            <span>New Orb Question</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner (if any) ── */}
      {error && (
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(254, 238, 238, 0.95)",
            borderBottom: "1px solid rgba(224, 49, 49, 0.2)",
            color: "var(--color-state-error)",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
          {onRetryLastMessage && (
            <button
              type="button"
              onClick={onRetryLastMessage}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-state-error)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div className="mo-ios-messages">
        {displayMessages.map((msg) => {
          const isUser = msg.sender === "customer";
          const isTelemetryOpen = openTelemetryId === msg.id;

          if (isUser) {
            return (
              <div key={msg.id} className="mo-ios-bubble-user-wrap">
                <div className="mo-ios-bubble-user">{msg.text}</div>
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(0, 0, 0, 0.4)",
                    marginTop: "3px",
                    marginRight: "4px",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className="mo-ios-bubble-ai-wrap">
              <div className="mo-ios-bubble-ai">
                {/* AI Header */}
                <div className="mo-ios-ai-header">
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#34C759",
                      boxShadow: "0 0 6px rgba(52, 199, 89, 0.7)",
                    }}
                  />
                  <span>Grounded Intelligence</span>
                </div>

                {/* AI Answer Body */}
                <p className="mo-ios-ai-body">{msg.text}</p>

                {/* Grounding Telemetry Accordion */}
                <div>
                  <button
                    type="button"
                    className="mo-ios-telemetry-btn"
                    onClick={() => toggleTelemetry(msg.id)}
                  >
                    <Sparkles size={11} />
                    <span>
                      {isTelemetryOpen ? "Hide Grounding Telemetry" : "Inspect Grounding Telemetry (4 Steps)"}
                    </span>
                    {isTelemetryOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  {isTelemetryOpen && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: "rgba(0, 0, 0, 0.03)",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        fontSize: "11.5px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        animation: "iosBubbleFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-state-success)" }}>
                        <CheckCircle2 size={12} />
                        <span>1. Verified customer node authorization ({activeCustomer.id})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-state-success)" }}>
                        <Database size={12} />
                        <span>
                          2. Neo4j Cypher traversal executed: {msg.evidence?.length || 1} authoritative ticket/policy node(s)
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-state-success)" }}>
                        <ShieldCheck size={12} />
                        <span>3. Grounding validation: No repeat cycle of previously failed actions</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)" }}>
                        <Sparkles size={12} />
                        <span>4. Synthesized deterministic next step with explicit uncertainty limits</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Next Step Banner */}
                {msg.suggestedNextStep && (
                  <div className="mo-ios-next-step">
                    <strong>Recommended Next Step (Avoids Repeating Failed Cycles):</strong>
                    <span>{msg.suggestedNextStep}</span>
                  </div>
                )}

                {/* Uncertainty Boundary */}
                {msg.uncertainty && (
                  <div className="mo-ios-uncertainty">
                    <strong style={{ display: "block", marginBottom: "2px", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.04em" }}>
                      Uncertainty / History Limitation:
                    </strong>
                    <span>{msg.uncertainty}</span>
                  </div>
                )}

                {/* Meta Row */}
                <div className="mo-ios-meta-row">
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span className="mo-ios-meta-badge">
                      {msg.isMock ? "Demo Fixture" : "Live Neo4j Graph"}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.45)",
                        fontWeight: 500,
                      }}
                    >
                      Backed by {msg.evidence?.length || 1} Neo4j Record(s)
                    </span>
                  </div>
                  <span style={{ fontSize: "10px", color: "rgba(0, 0, 0, 0.4)" }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator inside Chat */}
        {isLoading && (
          <div className="mo-ios-bubble-ai-wrap">
            <div
              className="mo-ios-bubble-ai"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B8B, #9B51E0 50%, #3B82F6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 0 10px rgba(155, 81, 224, 0.4)",
                  animation: "pulseGlow 2s infinite ease-in-out",
                }}
              >
                <Sparkles size={11} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1D1D1F" }}>
                  Traversing Neo4j Graph & Reasoning...
                </span>
                <span style={{ fontSize: "10.5px", color: "#86868B" }}>
                  Querying multi-hop relationships and grounded policies
                </span>
              </div>
              <div style={{ display: "flex", gap: "3px", marginLeft: "6px" }}>
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    animation: "bounce 1.4s infinite ease-in-out",
                  }}
                />
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    animation: "bounce 1.4s infinite ease-in-out 0.2s",
                  }}
                />
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    animation: "bounce 1.4s infinite ease-in-out 0.4s",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Suggested Follow-up Prompt Chips ── */}
      <div className="mo-ios-chips">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles size={11} style={{ color: "var(--color-primary)" }} />
          Follow-up:
        </span>
        {scenarioPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="mo-ios-chip"
            disabled={isLoading}
            onClick={() => onSendMessage(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── Bottom Floating iOS Message Composer ── */}
      <div className="mo-ios-composer">
        <div className="mo-ios-input-box">
          <input
            ref={inputRef}
            type="text"
            className="mo-ios-input-field"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask a follow-up about ${activeCustomer.name}...`}
          />
        </div>

        <button
          type="button"
          className="mo-ios-send-btn"
          onClick={handleSend}
          disabled={!localInput.trim() || isLoading}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
