import React, { useState } from "react";
import { GitGraph, ShieldCheck } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "Customer" | "Ticket" | "Issue" | "Action" | "Outcome" | "Policy";
  color: string;
  x: number;
  y: number;
  r: number;
  properties: Record<string, string>;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: "n_sarah",
    label: "Sarah Chen",
    type: "Customer",
    color: "#3b82f6",
    x: 80,
    y: 180,
    r: 22,
    properties: { id: "CUST-001", tier: "Enterprise", status: "Active", ltv: "$48,000" },
  },
  {
    id: "n_marcus",
    label: "Marcus Vance",
    type: "Customer",
    color: "#3b82f6",
    x: 80,
    y: 330,
    r: 20,
    properties: { id: "CUST-002", tier: "Growth", status: "Active", ltv: "$14,500" },
  },
  {
    id: "n_t101",
    label: "Ticket T-101",
    type: "Ticket",
    color: "#00f2fe",
    x: 230,
    y: 140,
    r: 18,
    properties: { ticket_id: "T-101", priority: "P1-Critical", created: "2026-10-10" },
  },
  {
    id: "n_t204",
    label: "Ticket T-204",
    type: "Ticket",
    color: "#00f2fe",
    x: 230,
    y: 280,
    r: 18,
    properties: { ticket_id: "T-204", priority: "P2-High", created: "2026-10-09" },
  },
  {
    id: "n_issue_auth",
    label: "Auth Lockout",
    type: "Issue",
    color: "#a855f7",
    x: 390,
    y: 110,
    r: 18,
    properties: { category: "IAM", error_code: "AUTH_401_LOCK", severity: "High" },
  },
  {
    id: "n_issue_bill",
    label: "Billing Sync",
    type: "Issue",
    color: "#a855f7",
    x: 390,
    y: 260,
    r: 18,
    properties: { category: "Billing", invoice_ref: "INV-8911", severity: "Medium" },
  },
  {
    id: "n_act_pwd",
    label: "Password Reset",
    type: "Action",
    color: "#f59e0b",
    x: 550,
    y: 110,
    r: 17,
    properties: { method: "automated_sms_token", gateway: "Twilio", max_attempts: "3" },
  },
  {
    id: "n_act_inv",
    label: "Invoice Reissue",
    type: "Action",
    color: "#f59e0b",
    x: 550,
    y: 260,
    r: 17,
    properties: { method: "stripe_webhook_resend", currency: "USD", tax_exempt: "false" },
  },
  {
    id: "n_out_fail",
    label: "FAILED (SMS Expired)",
    type: "Outcome",
    color: "#ef4444",
    x: 720,
    y: 110,
    r: 19,
    properties: { outcome: "FAILED", failure_reason: "User token expired after 180s timeout" },
  },
  {
    id: "n_out_res",
    label: "RESOLVED",
    type: "Outcome",
    color: "#10b981",
    x: 720,
    y: 260,
    r: 19,
    properties: { outcome: "RESOLVED", confirmation_id: "RES_77192", satisfaction: "5/5" },
  },
  {
    id: "n_policy",
    label: "Enterprise SLA (15m)",
    type: "Policy",
    color: "#ec4899",
    x: 390,
    y: 370,
    r: 18,
    properties: { response_sla: "15 min", escalation_tier: "VP Engineering", coverage: "24/7" },
  },
];

const GRAPH_LINKS: GraphLink[] = [
  { source: "n_sarah", target: "n_t101", label: "HAS_TICKET" },
  { source: "n_sarah", target: "n_policy", label: "COVERED_BY" },
  { source: "n_marcus", target: "n_t204", label: "HAS_TICKET" },
  { source: "n_t101", target: "n_issue_auth", label: "REGARDS_ISSUE" },
  { source: "n_t204", target: "n_issue_bill", label: "REGARDS_ISSUE" },
  { source: "n_issue_auth", target: "n_act_pwd", label: "TRIED_ACTION" },
  { source: "n_issue_bill", target: "n_act_inv", label: "TRIED_ACTION" },
  { source: "n_act_pwd", target: "n_out_fail", label: "RESULTED_IN" },
  { source: "n_act_inv", target: "n_out_res", label: "RESULTED_IN" },
];

export const KnowledgeGraphSection: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("n_out_fail");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];

  // Helper to determine if a node or link is connected to selected or hovered node
  const isConnected = (sourceId: string, targetId: string) => {
    const focusId = hoveredNodeId || selectedNodeId;
    if (!focusId) return false;
    return sourceId === focusId || targetId === focusId;
  };

  return (
    <section id="graph" style={{ marginBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="section-tag">
          <GitGraph size={13} /> KNOWLEDGE TOPOLOGY
        </div>
        <h2 className="section-title">
          Interactive Neo4j Knowledge Graph
        </h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Explore the live directed entity graph. Every customer claim is traversed multi-hop to confirm
          past attempts, system outcomes, and SLA policies.
        </p>
      </div>

      <div
        className="liquid-glass-surface"
        style={{
          borderRadius: "var(--radius-editorial)",
          padding: "32px",
          border: "1px solid rgba(0, 242, 254, 0.2)",
          display: "grid",
          gridTemplateColumns: "1fr 310px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* SVG Graph Canvas */}
        <div
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(10, 18, 38, 0.9) 0%, rgba(4, 7, 16, 0.98) 100%)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "16px",
            overflowX: "auto",
            position: "relative",
          }}
        >
          {/* Header Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "12px",
              fontSize: "11px",
              color: "var(--text-muted)",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6" }} /> Customer
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#00f2fe" }} /> Ticket
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#a855f7" }} /> Issue
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} /> Action
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} /> Failed
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} /> Resolved
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ec4899" }} /> Policy
            </span>
          </div>

          <svg width="800" height="420" viewBox="0 0 800 420" style={{ display: "block", margin: "0 auto" }}>
            {/* Defs for gradients & arrow markers */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe" opacity="0.8" />
              </marker>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Render Links */}
            {GRAPH_LINKS.map((link, idx) => {
              const src = GRAPH_NODES.find((n) => n.id === link.source)!;
              const tgt = GRAPH_NODES.find((n) => n.id === link.target)!;
              const active = isConnected(link.source, link.target);

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={active ? "#00f2fe" : "rgba(255, 255, 255, 0.15)"}
                    strokeWidth={active ? 2.5 : 1.5}
                    strokeDasharray={active ? "none" : "3,3"}
                    markerEnd="url(#arrow)"
                    className={active ? "flow-edge-animated" : ""}
                  />
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 6}
                    fill={active ? "#00f2fe" : "rgba(255, 255, 255, 0.35)"}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {GRAPH_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Outer pulse circle when selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      y={node.y}
                      r={node.r + 9}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}

                  {/* Node Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill="#0a1020"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Inner glowing dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r - 8}
                    fill={node.color}
                    opacity="0.8"
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + node.r + 14}
                    fill={isSelected || isHovered ? "#ffffff" : "var(--text-muted)"}
                    fontSize="10"
                    fontWeight={isSelected ? 700 : 500}
                    fontFamily="var(--font-heading)"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Properties Inspector */}
        <div
          style={{
            background: "rgba(6, 11, 25, 0.8)",
            borderRadius: "var(--radius-xl)",
            border: `1px solid ${activeNode.color}45`,
            padding: "20px",
            boxShadow: `0 10px 30px ${activeNode.color}15`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: `${activeNode.color}22`,
                color: activeNode.color,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {activeNode.type} NODE
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "monospace" }}>
              {activeNode.id}
            </span>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-main)", marginBottom: "14px" }}>
            {activeNode.label}
          </h3>

          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", marginBottom: "8px", textTransform: "uppercase" }}>
            Graph Properties
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
            {Object.entries(activeNode.properties).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11.5px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <span style={{ color: "var(--text-dim)", fontFamily: "monospace" }}>{key}:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(0, 242, 254, 0.08)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              fontSize: "11px",
              color: "var(--accent-cyan)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span>Fact indexed in Neo4j Bolt cluster</span>
          </div>
        </div>
      </div>
    </section>
  );
};
