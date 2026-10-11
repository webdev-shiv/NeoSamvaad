import React, { useState, useEffect } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { CustomerSelector } from "./components/CustomerSelector";
import { ChatPanel } from "./components/ChatPanel";
import { EvidencePanel } from "./components/EvidencePanel";
import type { CustomerProfile, Message, EvidenceItem, GraphPath, ConfidenceLevel } from "./types";
import { DEMO_CUSTOMERS } from "./services/mockData";
import { apiService } from "./services/api";

export const App: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile>(DEMO_CUSTOMERS[0]);
  const [customIdInput, setCustomIdInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");
  const [lastSentText, setLastSentText] = useState<string>("");
  const [isMockMode, setIsMockMode] = useState<boolean>(apiService.isMockMode());
  const [mobileEvidenceOpen, setMobileEvidenceOpen] = useState<boolean>(false);

  // Active evidence state (from latest response or initial customer selection)
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem[]>([]);
  const [activeGraphPaths, setActiveGraphPaths] = useState<GraphPath[]>([]);
  const [activeNextStep, setActiveNextStep] = useState<string | undefined>();
  const [activeUncertainty, setActiveUncertainty] = useState<string | undefined>();
  const [activeConfidence, setActiveConfidence] = useState<ConfidenceLevel>("GROUNDED_HIGH");

  // When customer changes, reset conversation state cleanly
  useEffect(() => {
    handleResetSession();
  }, [selectedCustomer.id]);

  const handleResetSession = () => {
    setMessages([]);
    setError(null);
    setDraftText("");
    setLastSentText("");
    setActiveEvidence([]);
    setActiveGraphPaths([]);
    setActiveNextStep(undefined);
    setActiveUncertainty(undefined);
    setActiveConfidence("GROUNDED_HIGH");
  };

  const handleToggleMock = () => {
    const nextVal = !isMockMode;
    apiService.setMockMode(nextVal);
    setIsMockMode(nextVal);
  };

  const handleApplyCustomId = () => {
    if (!customIdInput.trim()) return;
    const customId = customIdInput.trim().toUpperCase();
    const newCust: CustomerProfile = {
      id: customId,
      name: `Custom Customer (${customId})`,
      tier: "Standard",
      description: "Custom user entered in interface.",
    };
    setSelectedCustomer(newCust);
    setCustomIdInput("");
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    setLastSentText(text);

    const userMessage: Message = {
      id: `msg_cust_${Date.now()}`,
      sender: "customer",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraftText("");
    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage(selectedCustomer.id, text);

      const assistantMessage: Message = {
        id: `msg_asst_${Date.now()}`,
        sender: "assistant",
        text: response.answer,
        timestamp: new Date().toISOString(),
        evidence: response.evidence,
        graphPaths: response.graph_paths,
        suggestedNextStep: response.suggested_next_step,
        uncertainty: response.uncertainty,
        isMock: response.is_mock,
        confidenceLevel: response.confidence_level,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update active evidence panel
      setActiveEvidence(response.evidence || []);
      setActiveGraphPaths(response.graph_paths || []);
      setActiveNextStep(response.suggested_next_step);
      setActiveUncertainty(response.uncertainty);
      setActiveConfidence(response.confidence_level);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // Restore draft so user's message is not lost
      setDraftText(text);

      const errMessage: Message = {
        id: `msg_err_${Date.now()}`,
        sender: "assistant",
        text: `Unable to complete response: ${msg}`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    if (lastSentText) {
      handleSendMessage(lastSentText);
    }
  };

  return (
    <div className="app-container">
      <Header
        isMockMode={isMockMode}
        onToggleMock={handleToggleMock}
        onResetSession={handleResetSession}
      />

      <div className="workspace-grid">
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          customIdInput={customIdInput}
          onCustomIdChange={setCustomIdInput}
          onApplyCustomId={handleApplyCustomId}
        />

        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          activeCustomer={selectedCustomer}
          error={error}
          draftText={draftText}
          onDraftChange={setDraftText}
          onSendMessage={handleSendMessage}
          onRetryLastMessage={handleRetryLastMessage}
          onDismissError={() => setError(null)}
          onOpenMobileEvidence={() => setMobileEvidenceOpen(true)}
          evidenceCount={activeEvidence.length}
        />

        <EvidencePanel
          customer={selectedCustomer}
          evidence={activeEvidence}
          graphPaths={activeGraphPaths}
          suggestedNextStep={activeNextStep}
          uncertainty={activeUncertainty}
          confidenceLevel={activeConfidence}
          isOpenMobile={mobileEvidenceOpen}
          onCloseMobile={() => setMobileEvidenceOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
