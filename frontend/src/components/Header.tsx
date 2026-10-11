import React from "react";
import { ShieldCheck, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

interface HeaderProps {
  isMockMode: boolean;
  onToggleMock: () => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMockMode, onToggleMock, onResetSession }) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            border: "1px solid var(--accent-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-blue)",
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Context-Aware Support Agent
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: isMockMode ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: isMockMode ? "#f59e0b" : "#10b981",
                border: `1px solid ${isMockMode ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
              }}
            >
              {isMockMode ? "MOCK / DEMO MODE" : "LIVE NEO4J + FASTAPI"}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Graph-RAG Grounded Reasoning • Member B Interface
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onToggleMock}
          title={isMockMode ? "Switch to Live API Mode" : "Switch to Mock Fixtures Mode"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "1px solid var(--border-highlight)",
            color: "var(--text-muted)",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.15s ease",
          }}
        >
          {isMockMode ? <ToggleRight size={18} color="#f59e0b" /> : <ToggleLeft size={18} />}
          <span>{isMockMode ? "Mock Fixtures Active" : "Live API Active"}</span>
        </button>

        <button
          onClick={onResetSession}
          title="Reset conversation state"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-main)",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          <RefreshCw size={14} />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
};
