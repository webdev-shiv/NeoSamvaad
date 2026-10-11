import { RefreshCw, ToggleLeft, ToggleRight, Activity, Cpu, Sparkles } from "lucide-react";

interface HeaderProps {
  isMockMode: boolean;
  onToggleMock: () => void;
  onResetSession: () => void;
  totalNodesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isMockMode,
  onToggleMock,
  onResetSession,
  totalNodesCount = 14,
}) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 28px",
        backgroundColor: "rgba(10, 15, 29, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            background: "var(--grad-primary)",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background: "linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NeoSamvaad
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: "var(--radius-full)",
                backgroundColor: isMockMode ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: isMockMode ? "#fbbf24" : "#34d399",
                border: `1px solid ${isMockMode ? "rgba(245, 158, 11, 0.35)" : "rgba(16, 185, 129, 0.35)"}`,
                letterSpacing: "0.03em",
              }}
            >
              {isMockMode ? "DEMO MODE (OFFLINE FIXTURES)" : "LIVE NEO4J GRAPH-RAG"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Cpu size={12} color="var(--accent-primary)" /> Context-Aware Support Engine
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>•</span>
            <span style={{ fontSize: "11.5px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Activity size={12} color="#10b981" /> ~24ms Verified Grounding
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Graph telemetry pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            backgroundColor: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
          <span>Graph Indexed: <strong style={{ color: "var(--text-main)" }}>{totalNodesCount} Entities</strong></span>
        </div>

        <button
          onClick={onToggleMock}
          title={isMockMode ? "Switch to Live API Mode" : "Switch to Mock Fixtures Mode"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-highlight)",
            color: "var(--text-main)",
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {isMockMode ? <ToggleRight size={18} color="#fbbf24" /> : <ToggleLeft size={18} color="#6366f1" />}
          <span>{isMockMode ? "Mock Mode" : "Live API"}</span>
        </button>

        <button
          onClick={onResetSession}
          title="Reset conversation state"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            border: "1px solid var(--border-highlight)",
            color: "var(--text-main)",
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <RefreshCw size={13} />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
};
