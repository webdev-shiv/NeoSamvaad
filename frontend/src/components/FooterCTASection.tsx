import React from "react";
import { ArrowRight, Cpu, Activity, GitBranch } from "lucide-react";

export const FooterCTASection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer style={{ position: "relative" }}>
      {/* Final Call to Action Card */}
      <div
        className="editorial-hero-card"
        style={{
          textAlign: "center",
          marginBottom: "60px",
          padding: "60px 30px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(circle, rgba(0, 242, 254, 0.16) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        {/* Central Floating Mini Core Symbol */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
            border: "1px solid rgba(0, 242, 254, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 0 30px rgba(0, 242, 254, 0.4)",
          }}
        >
          <Cpu size={32} color="#00f2fe" />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 4.5vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "16px",
            maxWidth: "750px",
            margin: "0 auto 16px",
            lineHeight: 1.15,
          }}
        >
          Elevate Support Automation Into Deterministic Truth.
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 1.8vw, 16.5px)",
            color: "var(--text-muted)",
            maxWidth: "600px",
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          Say goodbye to hallucinated support promises. Ground your AI support in verifiable Neo4j knowledge
          graphs with sub-30ms retrieval and full auditability.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => scrollTo("playground")}
            className="liquid-glass-btn-primary"
            style={{ padding: "14px 32px", fontSize: "14px" }}
          >
            Launch Live Agent <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollTo("overview")}
            className="liquid-glass-btn-secondary"
            style={{ padding: "14px 28px", fontSize: "14px" }}
          >
            Back to Top
          </button>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <div
        className="liquid-glass-pill"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          maxWidth: "1280px",
          margin: "0 auto 32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "15px", color: "var(--text-main)" }}>
            NEOSAMVAAD
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            &copy; 2026 IIITD Hackathon • Member B
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
          <a
            href="https://github.com/webdev-shiv/NeoSamvaad"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.2s",
            }}
          >
            <GitBranch size={14} /> Repository
          </a>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: 600 }}>
            <Activity size={13} /> Grounding Engine Active
          </span>
        </div>
      </div>
    </footer>
  );
};
