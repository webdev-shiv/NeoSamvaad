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
        backgroundColor: "var(--bg-deep)",
        position: "relative",
      }}
      aria-label="Customer Support Workspace"
    >
      {/* Subheader Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          backgroundColor: "rgba(16, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
            }}
          >
            <UserCheck size={16} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                {activeCustomer.name}
              </span>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "monospace" }}>
                [{activeCustomer.id}]
              </span>
              {activeCustomer.scenarioLabel && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    color: "var(--accent-primary)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                  }}
                >
                  {activeCustomer.scenarioLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {onOpenMobileEvidence && (
          <button
            onClick={onOpenMobileEvidence}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-primary)",
              fontSize: "12px",
              fontWeight: 600,
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
        onSelectPrompt={onSendMessage}
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
