import React, { useState, useEffect } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { CustomerSelector } from "./components/CustomerSelector";
import { ChatPanel } from "./components/ChatPanel";
import { EvidencePanel } from "./components/EvidencePanel";
import MorphOrb from "./components/ui/ai-thiking-orb-and-input";
import type { CustomerProfile, Message, EvidenceItem, GraphPath, ConfidenceLevel } from "./types";
import { DEMO_CUSTOMERS } from "./services/mockData";
import { apiService } from "./services/api";

import { BackendWorkflowSection } from "./components/BackendWorkflowSection";
import { Neo4jLiveGraph } from "./components/Neo4jLiveGraph";

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<"workspace" | "orb">("orb");
  const [heroState, setHeroState] = useState<"idle" | "animating" | "chat">("idle");
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
    setHeroState("idle");
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

  const handleOrbStart = () => {
    setHeroState("animating");
  };

  const handlePhaseChange = (phase: string) => {
    if (phase === "idle") {
      setHeroState("idle");
    } else if (phase === "launch" || phase === "assemble" || phase === "think" || phase === "resolve" || phase === "condense") {
      setHeroState("animating");
    } else if (phase === "unfold" || phase === "answered") {
      setHeroState("chat");
    }
  };

  const handleResetToOrb = () => {
    setHeroState("idle");
    handleResetSession();
  };

  const handleOrbSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setLastSentText(text);

    const userMessage: Message = {
      id: `msg_cust_${Date.now()}`,
      sender: "customer",
      text,
      timestamp: new Date().toISOString(),
    };

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

      setMessages([userMessage, assistantMessage]);

      setActiveEvidence(response.evidence || []);
      setActiveGraphPaths(response.graph_paths || []);
      setActiveNextStep(response.suggested_next_step);
      setActiveUncertainty(response.uncertainty);
      setActiveConfidence(response.confidence_level);

      return response.answer;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);

      const errMessage: Message = {
        id: `msg_err_${Date.now()}`,
        sender: "assistant",
        text: `Unable to complete response: ${msg}`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages([userMessage, errMessage]);
      return `Unable to answer: ${msg}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        isMockMode={isMockMode}
        onToggleMock={handleToggleMock}
        onResetSession={handleResetSession}
        activeView={viewMode}
        onViewChange={setViewMode}
      />

      {viewMode === "orb" ? (
        <div style={{ flex: 1, height: "calc(100vh - 65px)", overflowY: "auto", backgroundColor: "var(--color-surface-background)" }}>
          {/* Hero Section: AI Thinking Orb & Input with Dynamic Background and In-Place Chat Box */}
          <div
            style={{
              height: "calc(100vh - 65px)",
              minHeight: "640px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--color-surface-background)",
              overflow: "hidden",
            }}
          >
            {/* The Background Photo Layer (Visible in idle state, smoothly disappears when writing/submitting or in chat) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/neo4j-ai-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center 22%",
                backgroundRepeat: "no-repeat",
                opacity: heroState === "idle" ? 1 : 0,
                transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Subtle soft gradient overlay in idle state to ensure UI text contrast */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(247, 248, 250, 0.65) 100%)",
                opacity: heroState === "idle" ? 1 : 0,
                transition: "opacity 0.6s ease",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* Hero Title & Customer details (only visible during idle/animation before chat box opens) */}
            {heroState !== "chat" && (
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "0",
                  right: "0",
                  textAlign: "center",
                  zIndex: 5,
                  pointerEvents: "none",
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid var(--color-neutral-border)",
                    boxShadow: "var(--shadow-sm)",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--color-state-success)" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-primary)" }}>
                    Neo4j Graph-RAG Active
                  </span>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                  AI Thinking Orb & Input
                </h2>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "4px",
                    pointerEvents: "auto",
                  }}
                >
                  <span style={{ fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
                    Customer:
                  </span>
                  <select
                    value={selectedCustomer.id}
                    onChange={(e) => {
                      const found = DEMO_CUSTOMERS.find((c) => c.id === e.target.value);
                      if (found) setSelectedCustomer(found);
                    }}
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--color-primary)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: "0 1px 4px rgba(64, 105, 225, 0.15)",
                    }}
                    aria-label="Change customer persona"
                  >
                    {DEMO_CUSTOMERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: "12px", color: "var(--color-text-placeholder)" }}>• Powered by Graph-RAG</span>
                </div>
              </div>
            )}

            {/* Hero Main Body: Orb in idle/animating; ChatBox once answered */}
            <div
              style={{
                flex: 1,
                position: "relative",
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                padding: 0,
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
              }}
            >
              <MorphOrb
                onSubmit={handleOrbSubmit}
                onStart={handleOrbStart}
                onPhaseChange={handlePhaseChange}
                messages={messages}
                isLoading={isLoading}
                activeCustomer={selectedCustomer}
                error={error}
                onSendMessage={handleSendMessage}
                onRetryLastMessage={handleRetryLastMessage}
                onResetSession={handleResetToOrb}
                evidenceCount={activeEvidence.length}
              />
            </div>

            {/* Scroll Indicator (Visible in idle or animating states) */}
            {heroState !== "chat" && (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-surface-white)",
                  border: "1px solid var(--color-neutral-border)",
                  color: "var(--color-text-secondary)",
                  fontSize: "11px",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                <span>Scroll to Explore Neo4j Architecture & Live Graph ↓</span>
              </div>
            )}
          </div>

          {/* Backend Workflow & Architecture Section */}
          <BackendWorkflowSection />

          {/* Interactive Live Neo4j Graph Preview */}
          <div
            id="neo4j-live-graph-section"
            style={{
              padding: "20px 24px 80px",
              maxWidth: "1280px",
              margin: "0 auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-accent-4-light)",
                  color: "var(--color-accent-4)",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                <span>LIVE BOLT CONNECTION • REAL-TIME GRAPH CANVAS</span>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                Interactive Neo4j Knowledge Graph Explorer
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                Inspect live connecting nodes, execute multi-hop Cypher traversals, and drag entities across the graph canvas.
              </p>
            </div>

            <Neo4jLiveGraph />
          </div>
        </div>
      ) : (
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
            customers={DEMO_CUSTOMERS}
            onSelectCustomer={setSelectedCustomer}
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
      )}
    </div>
  );
};

export default App;
