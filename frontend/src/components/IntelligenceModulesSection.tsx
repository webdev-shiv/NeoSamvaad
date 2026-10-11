import React, { useState } from "react";
import { Terminal, Database, Activity, GitBranch, Zap, Search, Sparkles } from "lucide-react";

export const IntelligenceModulesSection: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("reasoning");

  return (
    <section id="modules" style={{ marginBottom: "80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="section-tag">
          <Sparkles size={13} /> CORE CAPABILITIES
        </div>
        <h2 className="section-title">
          Isometric Intelligence Modules
        </h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Engineered as discrete, decoupled cognitive units. Each module performs deterministic verification,
          ensuring every customer conversation is anchored in verifiable graph facts.
        </p>
      </div>

      {/* Grid of 6 Isometric Modules */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Module 1: Contextual Understanding */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("context")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "context" ? "1px solid rgba(0, 242, 254, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "context" ? "0 16px 40px rgba(0, 242, 254, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(0, 242, 254, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0, 242, 254, 0.3)",
                }}
              >
                <Search size={20} color="var(--accent-cyan)" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(0, 242, 254, 0.1)",
                  color: "var(--accent-cyan)",
                  fontWeight: 700,
                  border: "1px solid rgba(0, 242, 254, 0.25)",
                }}
              >
                INTENT EXTRACTION
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Contextual Understanding
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Parses conversational history, resolves customer entity ambiguities, and maps questions to specific Neo4j subgraphs.
            </p>
          </div>

          {/* Miniature Graphic: Isometric Radar Wave */}
          <div
            style={{
              height: "110px",
              background: "rgba(6, 11, 25, 0.6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg width="220" height="90" viewBox="0 0 220 90">
              <circle cx="110" cy="45" r="38" fill="none" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="110" cy="45" r="24" fill="none" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="1.5" />
              <circle cx="110" cy="45" r="10" fill="rgba(0, 242, 254, 0.2)" stroke="#00f2fe" strokeWidth="2" />
              <line x1="110" y1="45" x2="140" y2="25" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <circle cx="140" cy="25" r="4" fill="#10b981" />
            </svg>
            <span style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "10px", color: "var(--accent-cyan)", fontFamily: "monospace" }}>
              entity:RESOLVED
            </span>
          </div>
        </div>

        {/* Module 2: Knowledge Graphs (Multi-Hop) */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("graphs")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "graphs" ? "1px solid rgba(99, 102, 241, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "graphs" ? "0 16px 40px rgba(99, 102, 241, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(99, 102, 241, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}
              >
                <GitBranch size={20} color="#818cf8" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#818cf8",
                  fontWeight: 700,
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                }}
              >
                GRAPH RETRIEVAL
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Knowledge Graphs
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Traverses directed graph relationships (Customer → Ticket → Issue → Action → Outcome) in Neo4j.
            </p>
          </div>

          {/* Miniature Graphic: Interactive Node Topology */}
          <div
            style={{
              height: "110px",
              background: "rgba(6, 11, 25, 0.6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg width="220" height="90" viewBox="0 0 220 90">
              <line x1="30" y1="45" x2="80" y2="25" stroke="#3b82f6" strokeWidth="2" />
              <line x1="30" y1="45" x2="80" y2="65" stroke="#3b82f6" strokeWidth="2" />
              <line x1="80" y1="25" x2="140" y2="45" stroke="#10b981" strokeWidth="2" />
              <line x1="80" y1="65" x2="140" y2="45" stroke="#ec4899" strokeWidth="2" />
              <line x1="140" y1="45" x2="190" y2="30" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="30" cy="45" r="8" fill="#3b82f6" />
              <circle cx="80" cy="25" r="9" fill="#10b981" />
              <circle cx="80" cy="65" r="9" fill="#ec4899" />
              <circle cx="140" cy="45" r="11" fill="#6366f1" />
              <circle cx="190" cy="30" r="7" fill="#00f2fe" />
            </svg>
            <span style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "10px", color: "#818cf8", fontFamily: "monospace" }}>
              hop:3 (resolved)
            </span>
          </div>
        </div>

        {/* Module 3: Intelligent Reasoning (Cypher Code Terminal - Ref Image 2) */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("reasoning")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "reasoning" ? "1px solid rgba(0, 242, 254, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "reasoning" ? "0 16px 40px rgba(0, 242, 254, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(0, 242, 254, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0, 242, 254, 0.3)",
                }}
              >
                <Terminal size={20} color="var(--accent-cyan)" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(0, 242, 254, 0.1)",
                  color: "var(--accent-cyan)",
                  fontWeight: 700,
                  border: "1px solid rgba(0, 242, 254, 0.25)",
                }}
              >
                CYPHER RUNTIME
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Intelligent Reasoning
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Executes parameter-sanitized Cypher patterns to synthesize truthful next steps without unverified guesses.
            </p>
          </div>

          {/* Miniature Graphic: Cypher Code Terminal */}
          <div
            style={{
              height: "110px",
              background: "#040712",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(0, 242, 254, 0.25)",
              padding: "10px 12px",
              fontFamily: "monospace",
              fontSize: "10px",
              lineHeight: "1.4",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>
            <span style={{ color: "#00f2fe" }}>MATCH</span> (t:Ticket)-[:REGARDS]-&gt;(i)<br />
            <span style={{ color: "#00f2fe" }}>WHERE</span> t.outcome = <span style={{ color: "#ef4444" }}>"FAILED"</span><br />
            <span style={{ color: "#10b981" }}>RETURN</span> i.name, t.next_action
          </div>
        </div>

        {/* Module 4: Tool Execution */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("tools")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "tools" ? "1px solid rgba(245, 158, 11, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "tools" ? "0 16px 40px rgba(245, 158, 11, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <Zap size={20} color="#f59e0b" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                  fontWeight: 700,
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                }}
              >
                SECURE ACTIONS
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Tool Execution
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Invokes external APIs and automated remediation actions with strict schema contracts and audit logs.
            </p>
          </div>

          {/* Miniature Graphic: Conveyor Action Pipeline */}
          <div
            style={{
              height: "110px",
              background: "rgba(6, 11, 25, 0.6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 14px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#0284c7", margin: "0 auto 4px" }} />
              <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>AUTH</span>
            </div>
            <div style={{ height: "2px", width: "28px", background: "linear-gradient(90deg, #0284c7, #10b981)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#10b981", margin: "0 auto 4px" }} />
              <span style={{ fontSize: "9px", color: "#10b981", fontWeight: 700 }}>REMEDIATE</span>
            </div>
            <div style={{ height: "2px", width: "28px", background: "linear-gradient(90deg, #10b981, #f59e0b)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#f59e0b", margin: "0 auto 4px" }} />
              <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>AUDIT</span>
            </div>
          </div>
        </div>

        {/* Module 5: Memory and Retrieval (Tiered Silos - Ref Image 2) */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("memory")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "memory" ? "1px solid rgba(236, 72, 153, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "memory" ? "0 16px 40px rgba(236, 72, 153, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(236, 72, 153, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(236, 72, 153, 0.3)",
                }}
              >
                <Database size={20} color="#ec4899" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(236, 72, 153, 0.1)",
                  color: "#ec4899",
                  fontWeight: 700,
                  border: "1px solid rgba(236, 72, 153, 0.25)",
                }}
              >
                PERSISTENT GRAPH
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Memory and Retrieval
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Stores historical support tickets, attempted resolutions, and customer profile policies in tiered silos.
            </p>
          </div>

          {/* Miniature Graphic: Tiered Cylindrical Silos */}
          <div
            style={{
              height: "110px",
              background: "rgba(6, 11, 25, 0.6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#00f2fe" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#0284c7" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#0369a1" }} />
              <span style={{ fontSize: "9px", color: "var(--accent-cyan)", marginTop: "2px" }}>TICKETS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#059669" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#047857" }} />
              <span style={{ fontSize: "9px", color: "#10b981", marginTop: "2px" }}>ACTIONS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#a855f7" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#7c3aed" }} />
              <div style={{ width: "36px", height: "12px", borderRadius: "50%", backgroundColor: "#6d28d9" }} />
              <span style={{ fontSize: "9px", color: "#a855f7", marginTop: "2px" }}>POLICY</span>
            </div>
          </div>
        </div>

        {/* Module 6: Real-Time Insights (Gauge Meter - Ref Image 2) */}
        <div
          className="liquid-glass-surface"
          onMouseEnter={() => setActiveModule("gauge")}
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            border: activeModule === "gauge" ? "1px solid rgba(16, 185, 129, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: activeModule === "gauge" ? "0 16px 40px rgba(16, 185, 129, 0.2)" : "var(--shadow-lg)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                <Activity size={20} color="#10b981" />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  fontWeight: 700,
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                TELEMETRY
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
              Real-Time Insights
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
              Continuously profiles grounding fidelity, latency metrics, and prompt injection defense barriers.
            </p>
          </div>

          {/* Miniature Graphic: Semi-Circle Precision Gauge */}
          <div
            style={{
              height: "110px",
              background: "rgba(6, 11, 25, 0.6)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg width="180" height="90" viewBox="0 0 180 90">
              <path d="M 20 85 A 65 65 0 0 1 160 85" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 85 A 65 65 0 0 1 150 45" fill="none" stroke="url(#gaugeGrad6)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="90" cy="80" r="6" fill="#00f2fe" />
              <line x1="90" y1="80" x2="135" y2="40" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="gaugeGrad6" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ position: "absolute", bottom: "6px", fontSize: "11px", fontWeight: 700, color: "#10b981" }}>
              99.98% GROUNDED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
