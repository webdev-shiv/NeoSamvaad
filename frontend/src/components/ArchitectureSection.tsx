import React, { useState } from "react";
import { Layers, Network, Shield, Database, Server, CheckCircle2 } from "lucide-react";

interface ArchLayer {
  id: string;
  name: string;
  category: string;
  icon: typeof Server;
  color: string;
  borderColor: string;
  components: string[];
  specs: {
    protocol: string;
    throughput: string;
    security: string;
    description: string;
  };
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    id: "frontend",
    name: "Layer 1: Spatial Frontend Client",
    category: "PRESENTATION & 3D RUNTIME",
    icon: Layers,
    color: "#00f2fe",
    borderColor: "rgba(0, 242, 254, 0.4)",
    components: ["React 19 + Vite 5", "Three.js Spatial Chamber", "Liquid Glass Design System", "Strict TypeScript Engine"],
    specs: {
      protocol: "HTTPS / WSS (Localhost 5173)",
      throughput: "60 FPS 3D Engine, Sub-16ms Frame Times",
      security: "Client-side Content Security Policy, zero exposed secrets",
      description: "Delivers an immersive, responsive 3D spatial user experience with real-time reactive updates to chat, graph paths, and evidence cards.",
    },
  },
  {
    id: "gateway",
    name: "Layer 2: FastAPI REST Service",
    category: "ORCHESTRATION & ROUTING",
    icon: Server,
    color: "#10b981",
    borderColor: "rgba(16, 185, 129, 0.4)",
    components: ["FastAPI Application", "Pydantic v2 Contract Validation", "CORS & Rate Limiter", "Mock/Live Mode Switcher"],
    specs: {
      protocol: "REST HTTP/1.1 JSON (Port 8000)",
      throughput: "> 4,500 req/sec asynchronous event loop",
      security: "Bearer token authentication, strict CORS origins",
      description: "Serves as the high-speed gateway handling /api/chat, /api/customers, and session lifecycle endpoints conforming to CONTRACT_MEMBER_A_MEMBER_B.",
    },
  },
  {
    id: "grounding",
    name: "Layer 3: Pydantic Grounding Engine",
    category: "GUARDRAILS & ANTI-HALLUCINATION",
    icon: Shield,
    color: "#818cf8",
    borderColor: "rgba(129, 140, 248, 0.4)",
    components: ["Hallucination Verifier", "Prompt Injection Scanner", "Grounded Response Generator", "Evidence Linker"],
    specs: {
      protocol: "Internal Python Service (llm_adapter/)",
      throughput: "< 25ms validation latency",
      security: "Input sanitization, explicit fact boundary enforcement",
      description: "Guarantees that every generated assistant message is mathematically grounded in retrieved graph evidence. Unrecorded actions are strictly barred from assertion.",
    },
  },
  {
    id: "graph",
    name: "Layer 4: Neo4j Knowledge Graph & Tools",
    category: "DATA PERSISTENCE & EXECUTION",
    icon: Database,
    color: "#ec4899",
    borderColor: "rgba(236, 72, 153, 0.4)",
    components: ["Neo4j Community/Enterprise", "Bolt Cypher Protocol (Port 7687)", "14 Directed Entity Relations", "External Action Webhooks"],
    specs: {
      protocol: "Neo4j Bolt Protocol / Cypher v5",
      throughput: "< 18ms multi-hop path query traversal",
      security: "Parameterized Cypher queries, scoped read-only user",
      description: "Stores persistent relationships between customers, historical tickets, attempted actions, failed/resolved outcomes, and SLA policies.",
    },
  },
];

export const ArchitectureSection: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<ArchLayer>(ARCH_LAYERS[0]);

  return (
    <section id="architecture" style={{ marginBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="section-tag">
          <Network size={13} /> FULL-STACK TOPOLOGY
        </div>
        <h2 className="section-title">
          System Architecture & Technical Boundaries
        </h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Engineered for fault-tolerant enterprise operations with strict separation between UI,
          API routing, grounding guardrails, and persistent graph data.
        </p>
      </div>

      <div
        className="liquid-glass-surface"
        style={{
          borderRadius: "var(--radius-editorial)",
          padding: "36px 32px",
          border: "1px solid rgba(0, 242, 254, 0.2)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Left Column: Stack of Architecture Layers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ARCH_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer.id === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer)}
                style={{
                  backgroundColor: isSelected ? "rgba(15, 23, 42, 0.95)" : "rgba(8, 13, 26, 0.65)",
                  border: isSelected ? `2px solid ${layer.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--radius-lg)",
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: isSelected ? `0 10px 30px ${layer.color}25` : "none",
                  transform: isSelected ? "translateX(6px)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        backgroundColor: `${layer.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color={layer.color} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-main)" }}>
                        {layer.name}
                      </h4>
                      <span style={{ fontSize: "10px", color: layer.color, fontWeight: 700, letterSpacing: "0.04em" }}>
                        {layer.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  {layer.components.map((comp, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Layer Deep-Dive Inspector */}
        <div
          style={{
            background: "rgba(6, 11, 25, 0.85)",
            borderRadius: "var(--radius-xl)",
            border: `1px solid ${selectedLayer.color}45`,
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: `inset 0 0 50px ${selectedLayer.color}10`,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: `${selectedLayer.color}20`,
                  color: selectedLayer.color,
                  fontWeight: 800,
                  fontFamily: "monospace",
                }}
              >
                LAYER SPECIFICATION
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Production Ready
              </span>
            </div>

            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", marginBottom: "12px" }}>
              {selectedLayer.name}
            </h3>

            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "22px" }}>
              {selectedLayer.specs.description}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Communication Protocol
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: selectedLayer.color, fontFamily: "monospace" }}>
                  {selectedLayer.specs.protocol}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Performance Benchmark
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>
                  {selectedLayer.specs.throughput}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Security & Hardening
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>
                  {selectedLayer.specs.security}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#10b981",
            }}
          >
            <CheckCircle2 size={16} />
            <span>Standardized in CONTRACT_MEMBER_A_MEMBER_B.md</span>
          </div>
        </div>
      </div>
    </section>
  );
};
