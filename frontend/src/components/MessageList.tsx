import React, { useRef, useEffect } from "react";
import type { Message, CustomerProfile } from "../types";
import { MessageBubble } from "./MessageBubble";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  onRetryMessage?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  activeCustomer,
  onRetryMessage,
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
          padding: "40px 20px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-blue)",
            marginBottom: "16px",
          }}
        >
          <MessageSquare size={24} />
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
          Ready for {activeCustomer.name}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-dim)", maxWidth: "420px", marginBottom: "16px" }}>
          {activeCustomer.description || "Send a message or select a demo prompt below to begin testing graph-grounded support."}
        </p>
        <div
          style={{
            padding: "8px 14px",
            backgroundColor: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Customer ID: <code style={{ color: "var(--accent-blue)" }}>{activeCustomer.id}</code> • Tier: {activeCustomer.tier}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 24px",
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
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            maxWidth: "300px",
            marginBottom: "16px",
          }}
        >
          <div
            className="animate-pulse-glow"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-blue)",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Retrieving Neo4j graph & grounding response...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
