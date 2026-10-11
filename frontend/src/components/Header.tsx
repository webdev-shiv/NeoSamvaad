import { RefreshCw, Activity, Cpu, Sparkles } from "lucide-react";

interface HeaderProps {
  isMockMode: boolean;
  onToggleMock?: () => void;
  onResetSession: () => void;
  activeView?: "workspace" | "orb";
  onViewChange?: (view: "workspace" | "orb") => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMockMode,
  onResetSession,
  activeView = "workspace",
  onViewChange,
}) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 28px",
        backgroundColor: "var(--color-surface-white)",
        borderBottom: "1px solid var(--color-neutral-divider)",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-click) 100%)",
            boxShadow: "0 4px 14px rgba(64, 105, 225, 0.28)",
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
                color: "var(--color-text-primary)",
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
                backgroundColor: isMockMode ? "var(--color-secondary-light)" : "var(--color-state-success-light)",
                color: isMockMode ? "var(--color-secondary)" : "var(--color-state-success)",
                border: `1px solid ${isMockMode ? "rgba(244, 168, 37, 0.35)" : "rgba(0, 126, 20, 0.35)"}`,
                letterSpacing: "0.03em",
              }}
            >
              {isMockMode ? "DEMO MODE (OFFLINE FIXTURES)" : "LIVE NEO4J GRAPH-RAG"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Cpu size={12} color="var(--color-primary)" /> Context-Aware Support Engine
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-neutral-icon)" }}>•</span>
            <span style={{ fontSize: "11.5px", color: "var(--color-text-placeholder)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Activity size={12} color="var(--color-state-success)" /> ~24ms Verified Grounding
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>


        {onViewChange && (
          <button
            onClick={() => onViewChange(activeView === "orb" ? "workspace" : "orb")}
            title="Toggle AI Orb view"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: activeView === "orb" ? "var(--color-primary)" : "var(--color-surface-background)",
              border: activeView === "orb" ? "1px solid var(--color-primary-click)" : "1px solid var(--color-neutral-border)",
              color: activeView === "orb" ? "#ffffff" : "var(--color-text-primary)",
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: activeView === "orb" ? "0 2px 10px rgba(64, 105, 225, 0.3)" : "none",
            }}
          >
            <Sparkles size={14} />
            <span>{activeView === "orb" ? "Workspace View" : "Thinking Orb View"}</span>
          </button>
        )}

        <button
          onClick={onResetSession}
          title="Reset conversation state"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-neutral-border)",
            color: "var(--color-text-primary)",
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <RefreshCw size={13} color="var(--color-neutral-icon)" />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
};
