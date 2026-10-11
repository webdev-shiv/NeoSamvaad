import React from "react";
import { Cpu, ArrowRight, RefreshCw, Zap } from "lucide-react";

interface NavbarProps {
  isMockMode: boolean;
  onToggleMock: () => void;
  onResetSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMockMode,
  onToggleMock,
  onResetSession,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: "16px",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "0 20px",
        marginBottom: "24px",
      }}
    >
      <nav
        className="liquid-glass-pill"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "28px",
          padding: "10px 24px",
          width: "100%",
          maxWidth: "1280px",
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => scrollTo("overview")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00f2fe 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(0, 242, 254, 0.4)",
            }}
          >
            <Cpu size={18} color="#050811" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "var(--text-main)",
              }}
            >
              NEOSAMVAAD
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 7px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(0, 242, 254, 0.12)",
                color: "var(--accent-cyan)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                border: "1px solid rgba(0, 242, 254, 0.25)",
              }}
            >
              3D INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div
          className="desktop-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          <button
            onClick={() => scrollTo("overview")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => scrollTo("modules")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Modules
          </button>
          <button
            onClick={() => scrollTo("workflow")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            How it Works
          </button>
          <button
            onClick={() => scrollTo("graph")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => scrollTo("architecture")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Architecture
          </button>
          <button
            onClick={() => scrollTo("playground")}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-cyan)",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Zap size={13} /> Live Agent
          </button>
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onToggleMock}
            title={isMockMode ? "Switch to Live FastAPI Backend" : "Switch to Mock Fixtures"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: "var(--radius-full)",
              background: isMockMode ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.14)",
              border: `1px solid ${isMockMode ? "rgba(245, 158, 11, 0.35)" : "rgba(16, 185, 129, 0.4)"}`,
              color: isMockMode ? "#fcd34d" : "#6ee7b7",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: isMockMode ? "#f59e0b" : "#10b981",
                boxShadow: isMockMode
                  ? "0 0 6px rgba(245, 158, 11, 0.8)"
                  : "0 0 8px rgba(16, 185, 129, 0.8)",
              }}
            />
            {isMockMode ? "MOCK FIXTURES" : "LIVE NEO4J"}
          </button>

          <button
            onClick={onResetSession}
            title="Reset active support session"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} />
          </button>

          <button
            onClick={() => scrollTo("playground")}
            className="liquid-glass-btn-primary"
            style={{
              padding: "8px 18px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Launch Agent <ArrowRight size={14} />
          </button>
        </div>
      </nav>
    </header>
  );
};
