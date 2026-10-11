import React from "react";
import { ArrowRight, Layers, ShieldCheck, Terminal, Database } from "lucide-react";
import { AIChamberCanvas } from "./3d/AIChamberCanvas";

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" style={{ position: "relative", marginBottom: "64px" }}>
      {/* Background Isometric Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background: "radial-gradient(circle, rgba(0, 242, 254, 0.14) 0%, rgba(16, 185, 129, 0.08) 35%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main Rounded Editorial Card Frame (Reference Image 4 & 3) */}
      <div className="editorial-hero-card" style={{ position: "relative", zIndex: 1 }}>
        {/* Subtle Decorative Circuit Grid Lines */}
        <div className="circuit-line-h" style={{ top: "32px", left: "10%", right: "10%" }} />
        <div className="circuit-line-v" style={{ left: "48px", top: "15%", bottom: "15%" }} />
        <div className="circuit-line-v" style={{ right: "48px", top: "15%", bottom: "15%" }} />

        {/* Top Tag & Header */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 36px" }}>
          <div className="section-tag" style={{ margin: "0 auto 16px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-cyan)",
                boxShadow: "0 0 10px rgba(0, 242, 254, 0.8)",
              }}
            />
            NEO4J GRAPH GROUNDED • DETERMINISTIC AI AGENT
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(38px, 6vw, 68px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: "18px",
              textTransform: "uppercase",
            }}
          >
            INTELLIGENCE,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00f2fe 0%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CONNECTED.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 17.5px)",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              maxWidth: "720px",
              margin: "0 auto 30px",
            }}
          >
            A high-fidelity spatial support intelligence agent combining graph-structured memory,
            deterministic Cypher traversals, and anti-hallucination grounding. Delivering mathematical certainty
            across complex customer states.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => scrollTo("playground")}
              className="liquid-glass-btn-primary"
            >
              Explore the Agent <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("architecture")}
              className="liquid-glass-btn-secondary"
            >
              <Layers size={16} /> View Architecture
            </button>
          </div>
        </div>

        {/* 3D Centerpiece Stage with Floating Spatial Cards */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "560px",
            borderRadius: "var(--radius-xl)",
            background: "radial-gradient(ellipse at 50% 50%, rgba(10, 18, 36, 0.8) 0%, rgba(4, 7, 16, 0.95) 85%)",
            border: "1px solid rgba(0, 242, 254, 0.2)",
            boxShadow: "inset 0 0 60px rgba(0, 242, 254, 0.08), 0 25px 60px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Three.js Interactive AI Chamber Canvas */}
          <AIChamberCanvas />

          {/* Floating Spatial Card 1: Top Left (Precision Metric) */}
          <div
            className="liquid-glass-surface"
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              maxWidth: "240px",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              animation: "fadeIn 0.5s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                Grounding Precision
              </span>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "#10b981" }}>
              99.98%
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Zero unsupported claims passed to customer
            </div>
          </div>

          {/* Floating Spatial Card 2: Top Right (Live Cypher Engine) */}
          <div
            className="liquid-glass-surface"
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              maxWidth: "270px",
              border: "1px solid rgba(0, 242, 254, 0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Terminal size={14} color="var(--accent-cyan)" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)" }}>
                CYPHER_REASONING.V2
              </span>
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "10.5px",
                lineHeight: "1.4",
                color: "#94a3b8",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "#00f2fe" }}>MATCH</span> (c)-[:<span style={{ color: "#ec4899" }}>HAS_TICKET</span>]-&gt;(t)<br />
              <span style={{ color: "#00f2fe" }}>WHERE</span> t.outcome = <span style={{ color: "#f59e0b" }}>"FAILED"</span><br />
              <span style={{ color: "#10b981" }}>RETURN</span> t.id, t.action
            </div>
          </div>

          {/* Floating Spatial Card 3: Bottom Left (Anti-Hallucination Guardrail) */}
          <div
            className="liquid-glass-surface"
            style={{
              position: "absolute",
              bottom: "24px",
              left: "24px",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              maxWidth: "250px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <ShieldCheck size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
                Anti-Hallucination
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Grounding validator verifies every statement against explicit Neo4j nodes before sending.
            </div>
          </div>

          {/* Floating Spatial Card 4: Bottom Right (In-Memory Neo4j Cluster) */}
          <div
            className="liquid-glass-surface"
            style={{
              position: "absolute",
              bottom: "24px",
              right: "24px",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              maxWidth: "240px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Database size={14} color="#a855f7" />
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-main)" }}>
                  Neo4j Bolt Cluster
                </span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#10b981", fontWeight: 700 }}>
                24ms
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Multi-hop graph traversals with 14 directed relations
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
