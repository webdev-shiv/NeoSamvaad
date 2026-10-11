import React from "react";
import type { Message, CustomerProfile } from "../types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ErrorState } from "./ErrorState";
import { Network, UserCheck } from "lucide-react";

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  error: string | null;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSendMessage: (text: string) => void;
  onRetryLastMessage?: () => void;
  onDismissError?: () => void;
  onOpenMobileEvidence?: () => void;
  evidenceCount?: number;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  activeCustomer,
  error,
  draftText,
  onDraftChange,
  onSendMessage,
  onRetryLastMessage,
  onDismissError,
  onOpenMobileEvidence,
  evidenceCount = 0,
}) => {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-primary)",
        position: "relative",
      }}
      aria-label="Customer Support Workspace"
    >
      {/* Subheader */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserCheck size={16} color="var(--accent-blue)" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
            {activeCustomer.name}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            ({activeCustomer.id})
          </span>
          {activeCustomer.scenarioLabel && (
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                backgroundColor: "var(--bg-surface-elevated)",
                color: "var(--text-muted)",
                padding: "2px 8px",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {activeCustomer.scenarioLabel}
            </span>
          )}
        </div>

        {onOpenMobileEvidence && (
          <button
            onClick={onOpenMobileEvidence}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-blue)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <Network size={14} />
            <span>View Graph ({evidenceCount})</span>
          </button>
        )}
      </div>

      {/* Error alert if present */}
      {error && (
        <ErrorState
          message={error}
          onRetry={onRetryLastMessage}
          onDismiss={onDismissError}
        />
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        activeCustomer={activeCustomer}
        onRetryMessage={onRetryLastMessage}
      />

      {/* Message Composer */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        draftText={draftText}
        onDraftChange={onDraftChange}
        currentScenarioLabel={activeCustomer.scenarioLabel}
      />
    </main>
  );
};
