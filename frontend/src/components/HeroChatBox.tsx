import React, { useState, useRef, useEffect } from "react";
import type { Message, CustomerProfile } from "../types";
import { MessageBubble } from "./MessageBubble";
import { Bot, Sparkles, RotateCcw, Send, ArrowDown, Network, ShieldCheck } from "lucide-react";

interface HeroChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  error: string | null;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSendMessage: (text: string) => void;
  onRetryLastMessage?: () => void;
  onDismissError?: () => void;
  onResetToOrb: () => void;
  evidenceCount?: number;
}

export const HeroChatBox: React.FC<HeroChatBoxProps> = ({
  messages,
  isLoading,
  activeCustomer,
  error,
  draftText,
  onDraftChange,
  onSendMessage,
  onRetryLastMessage,
  onDismissError,
  onResetToOrb,
  evidenceCount = 0,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localInput, setLocalInput] = useState<string>("");

  // Sync draftText or local state
  useEffect(() => {
    if (draftText && !localInput) {
      setLocalInput(draftText);
    }
  }, [draftText]);

  // Auto-scroll when messages change or loading state updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const textToSend = localInput.trim() || draftText.trim();
    if (!textToSend || isLoading) return;
    onSendMessage(textToSend);
    setLocalInput("");
    onDraftChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const scrollToGraph = () => {
    const el = document.getElementById("neo4j-live-graph-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Quick contextual prompts based on customer
  const scenarioPrompts = activeCustomer.id.includes("1001") || activeCustomer.name.toLowerCase().includes("alice")
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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "960px",
        height: "calc(100vh - 120px)",
        minHeight: "560px",
        maxHeight: "720px",
        backgroundColor: "var(--color-surface-white)",
        borderRadius: "24px",
        border: "1px solid var(--color-neutral-border)",
        boxShadow: "0 20px 48px -12px rgba(0, 0, 0, 0.09), 0 4px 16px rgba(64, 105, 225, 0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        margin: "0 auto",
        animation: "chatBoxFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: "14px 20px",
          backgroundColor: "var(--color-surface-white)",
          borderBottom: "1px solid var(--color-neutral-divider)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          zIndex: 2,
        }}
      >
        {/* Left: AI & Customer Persona details */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary-light)",
              border: "1px solid rgba(64, 105, 225, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Bot size={20} />
            <span
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "var(--color-state-success)",
                border: "2px solid #ffffff",
              }}
              title="Online & Connected to Neo4j"
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
                Neo4j Graph-RAG Assistant
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "var(--color-state-success-light)",
                  color: "var(--color-state-success)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <ShieldCheck size={12} />
                Live Grounded
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
                Customer: <strong style={{ color: "var(--color-primary)" }}>{activeCustomer.name}</strong> ({activeCustomer.id})
              </span>
              {activeCustomer.scenarioLabel && (
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    backgroundColor: "var(--color-accent-1-light)",
                    color: "var(--color-accent-1)",
                    padding: "1px 7px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {activeCustomer.scenarioLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={scrollToGraph}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-surface-background)",
              border: "1px solid var(--color-neutral-border)",
              color: "var(--color-text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Scroll down to inspect live graph canvas"
          >
            <Network size={14} style={{ color: "var(--color-primary)" }} />
            <span>Graph View {evidenceCount > 0 ? `(${evidenceCount})` : ""}</span>
            <ArrowDown size={12} />
          </button>

          <button
            type="button"
            onClick={onResetToOrb}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              border: "1px solid rgba(64, 105, 225, 0.25)",
              color: "var(--color-primary)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Return to Thinking Orb & restore illustration background"
          >
            <RotateCcw size={13} />
            <span>New Orb Question</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            padding: "10px 18px",
            backgroundColor: "var(--color-state-error-light)",
            borderBottom: "1px solid rgba(224, 49, 49, 0.25)",
            color: "var(--color-state-error)",
            fontSize: "12.5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Error: {error}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            {onRetryLastMessage && (
              <button
                type="button"
                onClick={onRetryLastMessage}
                style={{
                  fontSize: "11.5px",
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
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                style={{
                  fontSize: "11.5px",
                  color: "var(--color-state-error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          backgroundColor: "var(--color-surface-background)",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={onRetryLastMessage} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-surface-white)",
              border: "1px solid var(--color-neutral-border)",
              boxShadow: "var(--shadow-sm)",
              width: "fit-content",
              maxWidth: "80%",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}
            >
              <Bot size={16} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Traversing Neo4j Graph & Reasoning...
              </span>
              <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                Extracting multi-hop evidence and bank policy rules
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px", marginLeft: "6px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  animation: "bounce 1.4s infinite ease-in-out",
                }}
              />
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  animation: "bounce 1.4s infinite ease-in-out 0.2s",
                }}
              />
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  animation: "bounce 1.4s infinite ease-in-out 0.4s",
                }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      <div
        style={{
          padding: "8px 20px",
          backgroundColor: "var(--color-surface-white)",
          borderTop: "1px solid var(--color-neutral-divider)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <span
          style={{
            fontSize: "11.5px",
            fontWeight: 700,
            color: "var(--color-text-placeholder)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles size={12} style={{ color: "var(--color-primary)" }} />
          Follow-up:
        </span>
        {scenarioPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPrompt(prompt)}
            style={{
              padding: "4px 11px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-surface-background)",
              border: "1px solid var(--color-neutral-border)",
              color: "var(--color-text-primary)",
              fontSize: "11.5px",
              whiteSpace: "nowrap",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.backgroundColor = "var(--color-primary-light)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-neutral-border)";
              e.currentTarget.style.backgroundColor = "var(--color-surface-background)";
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Message Composer */}
      <div
        style={{
          padding: "14px 20px",
          backgroundColor: "var(--color-surface-white)",
          borderTop: "1px solid var(--color-neutral-divider)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface-background)",
            border: "1px solid var(--color-neutral-border)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(64, 105, 225, 0.12)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--color-neutral-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              onDraftChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask a follow-up about ${activeCustomer.name}...`}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: "13.5px",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!localInput.trim() || isLoading}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: localInput.trim() && !isLoading ? "var(--color-primary)" : "var(--color-neutral-border)",
            border: "none",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: localInput.trim() && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: localInput.trim() && !isLoading ? "0 4px 12px rgba(64, 105, 225, 0.3)" : "none",
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
