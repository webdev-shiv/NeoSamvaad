import React, { useState } from "react";
import { MessageSquare, GitFork, Cpu, Wrench, CheckCircle2, ChevronRight, Activity } from "lucide-react";

interface WorkflowStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  icon: typeof MessageSquare;
  color: string;
  accentBg: string;
  details: {
    overview: string;
    action: string;
    outputSample: string;
    latency: string;
    safetyCheck: string;
  };
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "input",
    stepNumber: "01",
    title: "USER INPUT",
    subtitle: "Conversational Ingestion",
    icon: MessageSquare,
    color: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.12)",
    details: {
      overview: "Captures natural language query from active customer session with persona identification.",
      action: "Sanitizes raw input text and strips adversarial prompt injection tokens.",
      outputSample: '{ "customer_id": "CUST-001", "query": "Why did my password reset fail?" }',
      latency: "1.2 ms",
      safetyCheck: "Prompt injection containment scanner passed",
    },
  },
  {
    id: "retrieval",
    stepNumber: "02",
    title: "CONTEXT RETRIEVAL",
    subtitle: "Neo4j Graph Traversal",
    icon: GitFork,
    color: "#00f2fe",
    accentBg: "rgba(0, 242, 254, 0.12)",
    details: {
      overview: "Traverses historical customer records, tickets, actions, and SLA policy nodes.",
      action: "Executes parameterized Cypher query matching (c:Customer)-[:HAS_TICKET]->(t).",
      outputSample: 'Ticket T-101: attempt="password_reset", outcome="FAILED", notes="SMS code expired"',
      latency: "18.4 ms",
      safetyCheck: "Parameterized query prevents Cypher injection",
    },
  },
  {
    id: "reasoning",
    stepNumber: "03",
    title: "REASONING",
    subtitle: "Pydantic Grounded Synthesis",
    icon: Cpu,
    color: "#818cf8",
    accentBg: "rgba(129, 140, 248, 0.12)",
    details: {
      overview: "Correlates retrieved graph nodes against customer question using strict anti-hallucination rules.",
      action: "Synthesizes answer only referencing confirmed facts; flags unrecorded actions as unconfirmed.",
      outputSample: "Acknowledge SMS timeout in T-101; formulate next concrete investigative action.",
      latency: "420 ms",
      safetyCheck: "Zero unverified assertions permitted in generated payload",
    },
  },
  {
    id: "tool",
    stepNumber: "04",
    title: "TOOL EXECUTION",
    subtitle: "Remediation & Action",
    icon: Wrench,
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    details: {
      overview: "Triggers deterministic tools or next-step actions when policy conditions are satisfied.",
      action: "Determines whether to suggest IAM lock inspection or reissuing credentials.",
      outputSample: 'Suggested Next Step: "Check IAM account lock status"',
      latency: "8.5 ms",
      safetyCheck: "Restricted schema execution against authenticated service endpoints",
    },
  },
  {
    id: "response",
    stepNumber: "05",
    title: "RESPONSE",
    subtitle: "Audited Delivery",
    icon: CheckCircle2,
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.12)",
    details: {
      overview: "Delivers grounded response with attached evidence cards, graph paths, and confidence rating.",
      action: "Returns structured ChatResponse schema conforming to Member A/B contract.",
      outputSample: 'Confidence: GROUNDED_HIGH | Backed by Ticket T-101 evidence item',
      latency: "0.8 ms",
      safetyCheck: "Contract validation 100% compliant",
    },
  },
];

export const WorkflowSection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep>(WORKFLOW_STEPS[1]);

  return (
    <section id="workflow" style={{ marginBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="section-tag">
          <Activity size={13} /> DETERMINISTIC PIPELINE
        </div>
        <h2 className="section-title">
          How the Grounded Agent Operates
        </h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          From raw customer inquiry to verified response: an unbroken chain of mathematical certainty.
          Click any stage to inspect the execution pipeline.
        </p>
      </div>

      {/* Stepped Interactive Pipeline Track */}
      <div
        className="liquid-glass-surface"
        style={{
          borderRadius: "var(--radius-editorial)",
          padding: "36px 32px",
          border: "1px solid rgba(0, 242, 254, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Connecting Pathway SVG */}
        <div style={{ position: "relative", marginBottom: "36px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              const isSelected = selectedStep.id === step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  style={{
                    backgroundColor: isSelected ? "rgba(15, 23, 42, 0.95)" : "rgba(10, 16, 30, 0.65)",
                    border: isSelected ? `2px solid ${step.color}` : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 16px",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isSelected ? `0 10px 30px ${step.color}33` : "none",
                    transform: isSelected ? "translateY(-4px)" : "none",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: step.color, fontFamily: "monospace" }}>
                      STEP {step.stepNumber}
                    </span>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: step.accentBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} color={step.color} />
                    </div>
                  </div>

                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                    {step.title}
                  </h4>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    {step.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Panel */}
        <div
          style={{
            background: "rgba(5, 8, 17, 0.75)",
            borderRadius: "var(--radius-xl)",
            border: `1px solid ${selectedStep.color}40`,
            padding: "28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            boxShadow: `inset 0 0 40px ${selectedStep.color}15`,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "10.5px",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: selectedStep.accentBg,
                  color: selectedStep.color,
                  fontWeight: 800,
                  fontFamily: "monospace",
                }}
              >
                STAGE {selectedStep.stepNumber} INSPECTOR
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                Latency: <strong style={{ color: "var(--text-main)" }}>{selectedStep.details.latency}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginBottom: "10px" }}>
              {selectedStep.title} &mdash; {selectedStep.subtitle}
            </h3>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "14px" }}>
              {selectedStep.details.overview}
            </p>

            <div style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <ChevronRight size={16} color={selectedStep.color} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{selectedStep.details.action}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "8px" }}>
              Runtime Payload Snapshot
            </div>
            <pre
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                fontFamily: "monospace",
                fontSize: "11px",
                color: selectedStep.color,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                lineHeight: "1.5",
                marginBottom: "12px",
              }}
            >
              {selectedStep.details.outputSample}
            </pre>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11.5px",
                color: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <CheckCircle2 size={14} color="#10b981" />
              <span>{selectedStep.details.safetyCheck}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
