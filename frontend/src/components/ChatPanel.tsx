import React from "react";
import type { Message, CustomerProfile } from "../types";
import { IPhoneAiChatView } from "./IPhoneAiChatView";
import { DEMO_CUSTOMERS } from "../services/mockData";

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  activeCustomer: CustomerProfile;
  error: string | null;
  draftText?: string;
  onDraftChange?: (text: string) => void;
  onSendMessage: (text: string) => void;
  onRetryLastMessage?: () => void;
  onDismissError?: () => void;
  onOpenMobileEvidence?: () => void;
  evidenceCount?: number;
  customers?: CustomerProfile[];
  onSelectCustomer?: (customer: CustomerProfile) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  activeCustomer,
  error,
  onSendMessage,
  onRetryLastMessage,
  evidenceCount = 0,
  customers = DEMO_CUSTOMERS,
  onSelectCustomer,
}) => {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        backgroundColor: "var(--bg-deep)",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Customer Support Workspace"
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <IPhoneAiChatView
          messages={messages}
          isLoading={isLoading}
          activeCustomer={activeCustomer}
          error={error}
          onSendMessage={onSendMessage}
          onRetryLastMessage={onRetryLastMessage}
          onResetToOrb={() => {}}
          evidenceCount={evidenceCount}
          customers={customers}
          onSelectCustomer={onSelectCustomer}
          showCustomerDropdown={true}
        />
      </div>
    </main>
  );
};

export default ChatPanel;
