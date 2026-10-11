import { useState } from "react";
import type { EvidenceItem, GraphPath as GraphPathType, CustomerProfile, ConfidenceLevel } from "../types";
import { EvidenceCard } from "./EvidenceCard";
import { GraphPath } from "./GraphPath";
import { Network, Database, X, Terminal, Copy, Check } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"graph" | "records" | "cypher">("graph");
  const [copiedCypher, setCopiedCypher] = useState(false);

  const getConfidenceBadge = () => {
    switch (confidenceLevel) {
      case "GROUNDED_HIGH":
        return { label: "Fully Grounded", color: "#34d399", bg: "rgba(16, 185, 129, 0.15)" };
      case "LIMITED_EVIDENCE":
        return { label: "Limited Evidence", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" };
      case "NO_HISTORY":
        return { label: "Zero Prior History", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
      default:
        return { label: "Unconfirmed", color: "#f87171", bg: "rgba(239, 68, 68, 0.15)" };
    }
  };

  const badge = getConfidenceBadge();

  const generatedCypher = `// Authoritative Traversal for ${customer.id}
MATCH (c:Customer {id: '${customer.id}'})
OPTIONAL MATCH (c)-[:HAS_TICKET]->(t:Ticket)
OPTIONAL MATCH (t)-[:REGARDS_ISSUE]->(i:Issue)
OPTIONAL MATCH (i)-[:TRIED_ACTION]->(a:Attempt)
OPTIONAL MATCH (a)-[:RESULTED_IN]->(o:Outcome)
RETURN c, t, i, a, o
ORDER BY t.created_at DESC;`;

  const handleCopyCypher = () => {
    navigator.clipboard.writeText(generatedCypher);
    setCopiedCypher(true);
    setTimeout(() => setCopiedCypher(false), 2000);
  };

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
        padding: "18px",
      }}
      aria-label="Neo4j Evidence and Graph Panel"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Network size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>
            Neo4j Evidence Inspector
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

      {/* Target Identity Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 14px",
          backgroundColor: "var(--bg-surface-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div>
          <div style={{ fontSize: "10.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
            Subject Node
          </div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-main)" }}>
            {customer.name}
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: "var(--radius-full)",
            backgroundColor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.bg}`,
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
            gap: "5px",
            padding: "7px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeTab === "graph" ? "var(--bg-surface-elevated)" : "transparent",
            color: activeTab === "graph" ? "var(--text-main)" : "var(--text-muted)",
            border: activeTab === "graph" ? "1px solid var(--accent-primary)" : "1px solid transparent",
            fontSize: "11.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Network size={13} />
          <span>Graph</span>
        </button>
        <button
          onClick={() => setActiveTab("records")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "7px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeTab === "records" ? "var(--bg-surface-elevated)" : "transparent",
            color: activeTab === "records" ? "var(--text-main)" : "var(--text-muted)",
            border: activeTab === "records" ? "1px solid var(--accent-primary)" : "1px solid transparent",
            fontSize: "11.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Database size={13} />
          <span>Records ({evidence.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("cypher")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "7px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeTab === "cypher" ? "var(--bg-surface-elevated)" : "transparent",
            color: activeTab === "cypher" ? "var(--text-main)" : "var(--text-muted)",
            border: activeTab === "cypher" ? "1px solid var(--accent-primary)" : "1px solid transparent",
            fontSize: "11.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Terminal size={13} />
          <span>Cypher</span>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1 }}>
        {activeTab === "graph" ? (
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", fontWeight: 600 }}>
              Truthful Relationship Traversal:
            </div>
            <GraphPath
              graphPaths={graphPaths}
              evidence={evidence}
              suggestedNextStep={suggestedNextStep}
            />
          </div>
        ) : activeTab === "records" ? (
          <div>
            {evidence.length === 0 ? (
              <div
                style={{
                  padding: "28px 16px",
                  textAlign: "center",
                  backgroundColor: "var(--bg-deep)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                <Database size={26} color="var(--text-dim)" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                  Zero Graph Records
                </div>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: "1.4" }}>
                  Neo4j returned zero tickets for {customer.id}. Model will strictly avoid inventing history.
                </p>
              </div>
            ) : (
              evidence.map((item) => <EvidenceCard key={item.ticket_id} item={item} />)
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 600 }}>
                Cypher Query Engine
              </span>
              <button
                onClick={handleCopyCypher}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                {copiedCypher ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedCypher ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre
              style={{
                padding: "12px",
                backgroundColor: "var(--bg-deep)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "11px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                color: "var(--accent-cyan)",
                lineHeight: "1.5",
                overflowX: "auto",
              }}
            >
              {generatedCypher}
            </pre>
          </div>
        )}
      </div>

      {/* Uncertainty & Next Step Drawer */}
      {(uncertainty || suggestedNextStep) && (
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
          {suggestedNextStep && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>
                Grounded Next Step:
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-main)", fontWeight: 500 }}>
                {suggestedNextStep}
              </div>
            </div>
          )}
          {uncertainty && (
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>
                Uncertainty Boundary:
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                {uncertainty}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
