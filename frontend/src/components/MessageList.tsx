import React, { useRef, useEffect } from "react";
import type { Message, CustomerProfile } from "../types";
import { MessageBubble } from "./MessageBubble";
import { Sparkles, ShieldCheck, Database, Key } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  onRetryMessage?: () => void;
  onSelectPrompt?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  activeCustomer,
  onRetryMessage,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-primary-light)",
            border: "1px solid var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(64, 105, 225, 0.15)",
          }}
        >
          <Sparkles size={28} />
        </div>

        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "6px", letterSpacing: "-0.01em" }}>
          Context-Aware Workspace: {activeCustomer.name}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", maxWidth: "460px", marginBottom: "24px", lineHeight: "1.5" }}>
          {activeCustomer.description || "NeoSamvaad retrieves historical tickets from Neo4j before answering to prevent failed loops."}
        </p>

        {/* Quick Suggestion Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", width: "100%", maxWidth: "680px", marginBottom: "20px" }}>
          <button
            onClick={() => onSelectPrompt && onSelectPrompt("My account still isn't working.")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px 14px",
              backgroundColor: "var(--color-surface-white)",
              border: "1px solid var(--color-neutral-divider)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", color: "var(--color-state-error)", fontSize: "11px", fontWeight: 700 }}>
              <ShieldCheck size={14} />
              <span>TEST SCENARIO A</span>
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
              "My account still isn't working."
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-placeholder)" }}>
              Inspects failed ticket T-101 and avoids repeating password reset.
            </div>
          </button>

          <button
            onClick={() => onSelectPrompt && onSelectPrompt("Did you already clear my session cache?")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px 14px",
              backgroundColor: "var(--color-surface-white)",
              border: "1px solid var(--color-neutral-divider)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", color: "var(--color-secondary)", fontSize: "11px", fontWeight: 700 }}>
              <Key size={14} />
              <span>TEST SCENARIO B</span>
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
              "Did you clear my session cache?"
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-placeholder)" }}>
              Acknowledges unrecorded action cannot be confirmed from history.
            </div>
          </button>

          <button
            onClick={() => onSelectPrompt && onSelectPrompt("Hello, I need help setting up my account.")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px 14px",
              backgroundColor: "var(--color-surface-white)",
              border: "1px solid var(--color-neutral-divider)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", color: "var(--color-state-success)", fontSize: "11px", fontWeight: 700 }}>
              <Database size={14} />
              <span>TEST SCENARIO C</span>
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
              "I need help setting up my account."
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-placeholder)" }}>
              Gracefully handles brand new customer with zero records.
            </div>
          </button>
        </div>

        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--color-surface-background)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--color-neutral-divider)",
            fontSize: "11.5px",
            color: "var(--color-text-secondary)",
          }}
        >
          Customer ID: <code style={{ color: "var(--color-primary)", fontWeight: 700 }}>{activeCustomer.id}</code> • Tier: <strong style={{ color: "var(--color-text-primary)" }}>{activeCustomer.tier}</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
      }}
      role="log"
      aria-live="polite"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onRetry={onRetryMessage} />
      ))}

      {isLoading && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            backgroundColor: "var(--color-surface-white)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-neutral-divider)",
            maxWidth: "340px",
            marginBottom: "16px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="animate-pulse-glow"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "var(--color-primary)",
            }}
          />
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Querying Neo4j Knowledge Graph...
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-placeholder)" }}>
              Traversing tickets & grounding response
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
