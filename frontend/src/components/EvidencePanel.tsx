import { useState } from "react";
import type { EvidenceItem, GraphPath as GraphPathType, CustomerProfile, ConfidenceLevel } from "../types";
import { EvidenceCard } from "./EvidenceCard";
import { GraphPath } from "./GraphPath";
import { Network, Database, X } from "lucide-react";

interface EvidencePanelProps {
  customer: CustomerProfile;
  evidence: EvidenceItem[];
  graphPaths?: GraphPathType[];
  suggestedNextStep?: string;
  uncertainty?: string;
  confidenceLevel?: ConfidenceLevel;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  customer,
  evidence,
  graphPaths,
  suggestedNextStep,
  uncertainty,
  confidenceLevel = "GROUNDED_HIGH",
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<"graph" | "records">("graph");

  const getConfidenceBadge = () => {
    switch (confidenceLevel) {
      case "GROUNDED_HIGH":
        return { label: "Fully Grounded", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      case "LIMITED_EVIDENCE":
        return { label: "Limited Evidence", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
      case "NO_HISTORY":
        return { label: "No Prior History", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)" };
      default:
        return { label: "Unconfirmed", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
    }
  };

  const badge = getConfidenceBadge();

  return (
    <aside
      className={`evidence-panel-container ${isOpenMobile ? "mobile-open" : ""}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        padding: "16px",
      }}
      aria-label="Neo4j Evidence and Graph Panel"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Network size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
            Neo4j Evidence Panel
          </h2>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            aria-label="Close Evidence Panel"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          backgroundColor: "var(--bg-surface-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Subject Identity</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
            {customer.name} ({customer.id})
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "12px",
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("graph")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeTab === "graph" ? "var(--bg-surface-elevated)" : "transparent",
            color: activeTab === "graph" ? "var(--text-main)" : "var(--text-muted)",
            border: activeTab === "graph" ? "1px solid var(--accent-blue)" : "1px solid transparent",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Network size={14} />
          Graph Path ({graphPaths?.length || (evidence.length > 0 ? 1 : 0)})
        </button>
        <button
          onClick={() => setActiveTab("records")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeTab === "records" ? "var(--bg-surface-elevated)" : "transparent",
            color: activeTab === "records" ? "var(--text-main)" : "var(--text-muted)",
            border: activeTab === "records" ? "1px solid var(--accent-blue)" : "1px solid transparent",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Database size={14} />
          Records ({evidence.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1 }}>
        {activeTab === "graph" ? (
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px" }}>
              Truthful Relationship Traversal:
            </div>
            <GraphPath
              graphPaths={graphPaths}
              evidence={evidence}
              suggestedNextStep={suggestedNextStep}
            />
          </div>
        ) : (
          <div>
            {evidence.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  backgroundColor: "var(--bg-primary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                <Database size={24} color="var(--text-dim)" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>
                  No Historical Records Found
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                  Neo4j returned zero tickets for {customer.id}. Model will strictly avoid inventing past history.
                </p>
              </div>
            ) : (
              evidence.map((item) => <EvidenceCard key={item.ticket_id} item={item} />)
            )}
          </div>
        )}
      </div>

      {/* Uncertainty and Next Step Drawer */}
      {(uncertainty || suggestedNextStep) && (
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
          {suggestedNextStep && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", marginBottom: "2px" }}>
                Grounded Next Step:
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-main)" }}>
                {suggestedNextStep}
              </div>
            </div>
          )}
          {uncertainty && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "2px" }}>
                Uncertainty Boundary:
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                {uncertainty}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
