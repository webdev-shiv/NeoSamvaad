import React from "react";
import { Database, ShieldCheck, Cpu, CheckCircle2, Sparkles } from "lucide-react";

export const BackendWorkflowSection: React.FC = () => {
  return (
    <section
      style={{
        padding: "60px 24px",
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "48px",
      }}
      aria-label="Neo4j Graph-RAG Architecture & Backend Workflow"
    >
      {/* Editorial Headline & Value Propositions (Inspired by Image 1 & 2) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "36px",
          alignItems: "center",
        }}
      >
        <div>
          {/* Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              border: "1px solid rgba(64, 105, 225, 0.25)",
              color: "var(--color-primary)",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={13} />
            <span>THE GRAPH-NATIVE INTELLIGENCE PLATFORM • NEW</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--color-text-primary)",
              marginBottom: "16px",
            }}
          >
            GROUNDED. VERIFIABLE. ZERO HALLUCINATIONS.
          </h2>

          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.65",
              color: "var(--color-text-secondary)",
              maxWidth: "540px",
            }}
          >
            Traditional RAG blindly dumps vector text chunks into the context window, frequently hallucinating
            and repeating failed troubleshooting steps. <strong>NeoSamvaad</strong> anchors every single response in an
            authoritative <strong>Neo4j Property Graph</strong>—verifying identity, past tickets, attempted fixes, and
            explicit uncertainty limits before generating a single token.
          </p>
        </div>

        {/* Business Value & Telemetry Metrics (Inspired by Image 1 cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              padding: "24px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-placeholder)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Grounding Integrity
            </div>
            <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--color-primary)", letterSpacing: "-0.02em" }}>
              100%
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
              Every claim backed by explicit Cypher graph traversal paths.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              padding: "24px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-placeholder)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Graph Traversal Speed
            </div>
            <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--color-state-success)", letterSpacing: "-0.02em" }}>
              &lt;24ms
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
              Sub-millisecond entity lookups over Bolt binary protocol.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              padding: "24px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-placeholder)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Failed Action Loops
            </div>
            <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--color-secondary)", letterSpacing: "-0.02em" }}>
              0x
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
              Strictly quarantines failed historical actions from being repeated.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              padding: "24px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-placeholder)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Reliability Score
            </div>
            <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--color-accent-1)", letterSpacing: "-0.02em" }}>
              4.9 <span style={{ fontSize: "18px", color: "var(--color-text-placeholder)" }}>/ 5.0</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
              Zero hallucinated tickets across all benchmarked scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Stage Backend Architecture Pipeline (Inspired by Image 2 floating pill cards) */}
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
            The 4-Stage Neo4j Backend Workflow
          </h3>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            How customer queries are routed, grounded, and synthesized in real-time.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cpu size={20} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-primary)", letterSpacing: "0.06em" }}>
              PHASE 01 • INGESTION
            </span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)" }}>
              Identity & Persona Anchor
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Resolves <code>(:Customer)</code> node and verifies tenant authorization. Isolates history to prevent cross-customer data leakage.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-accent-1-light)",
                color: "var(--color-accent-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={20} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-accent-1)", letterSpacing: "0.06em" }}>
              PHASE 02 • TRAVERSAL
            </span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)" }}>
              Cypher Path Traversal
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Executes Cypher multi-hop query across <code>[:HAS_TICKET]</code>, <code>[:REGARDS_ISSUE]</code>, and <code>[:TRIED_ACTION]</code> relationships.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-secondary-light)",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-secondary)", letterSpacing: "0.06em" }}>
              PHASE 03 • QUARANTINE
            </span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)" }}>
              Anti-Loop Quarantine
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Identifies actions tagged <code>outcome: 'FAILED'</code>. Injects negative constraints into the prompt so failed cycles are never repeated.
            </p>
          </div>

          {/* Step 4 */}
          <div
            style={{
              backgroundColor: "var(--color-surface-white)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              border: "1px solid var(--color-neutral-divider)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-state-success-light)",
                color: "var(--color-state-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-state-success)", letterSpacing: "0.06em" }}>
              PHASE 04 • SYNTHESIS
            </span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)" }}>
              Grounded Response
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Generates calibrated recommendations with explicit uncertainty boundaries for missing or unrecorded customer actions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
