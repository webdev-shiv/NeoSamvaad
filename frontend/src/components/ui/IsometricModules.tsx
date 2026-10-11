import React from "react";
import { Terminal, Database, Activity, GitBranch } from "lucide-react";

export const IsometricModules: React.FC = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "18px",
        width: "100%",
      }}
    >
      {/* Module 1: Cypher Code Terminal (Reference Image 2) */}
      <div
        style={{
          backgroundColor: "rgba(10, 15, 29, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
          </div>
          <span style={{ fontSize: "10.5px", color: "var(--accent-cyan)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px" }}>
            <Terminal size={12} /> cypher_kernel.v1
          </span>
        </div>
        <pre
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "11px",
            lineHeight: "1.5",
            color: "#94a3b8",
            overflowX: "auto",
          }}
        >
          <span style={{ color: "#f59e0b" }}>{"// Traverse historical customer path\n"}</span>
          <span style={{ color: "#00f2fe" }}>MATCH</span> p=(c:<span style={{ color: "#10b981" }}>Customer</span>)-[r:<span style={{ color: "#ec4899" }}>HAS_TICKET</span>]-&gt;(t)<br />
          <span style={{ color: "#00f2fe" }}>MATCH</span> (t)-[:<span style={{ color: "#a855f7" }}>REGARDS_ISSUE</span>]-&gt;(i)-[:<span style={{ color: "#38bdf8" }}>TRIED_ACTION</span>]-&gt;(a)<br />
          <span style={{ color: "#00f2fe" }}>RETURN</span> p, a.outcome, t.status
        </pre>
      </div>

      {/* Module 2: Metric Gauge Meter (Reference Image 2) */}
      <div
        style={{
          backgroundColor: "rgba(10, 15, 29, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
            Grounding Precision Meter
          </span>
          <span style={{ fontSize: "10.5px", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            <Activity size={12} /> 99.98%
          </span>
        </div>

        {/* SVG Semi-Circle Gauge */}
        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
          <svg width="180" height="95" viewBox="0 0 180 95">
            {/* Background Arc */}
            <path
              d="M 20 90 A 70 70 0 0 1 160 90"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Active Arc (Cyan to Emerald) */}
            <path
              d="M 20 90 A 70 70 0 0 1 148 50"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Needle Pivot */}
            <circle cx="90" cy="85" r="7" fill="#00f2fe" />
            {/* Needle */}
            <line x1="90" y1="85" x2="135" y2="40" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
          <span>Zero Hallucination</span>
          <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>24ms Latency</span>
        </div>
      </div>

      {/* Module 3: Network Topology Board (Reference Image 2) */}
      <div
        style={{
          backgroundColor: "rgba(10, 15, 29, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
            Active Knowledge Graph
          </span>
          <span style={{ fontSize: "10.5px", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
            <GitBranch size={12} /> Multi-Hop
          </span>
        </div>

        {/* SVG Node Network Graphic */}
        <div style={{ height: "100px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="220" height="90" viewBox="0 0 220 90">
            {/* Edges */}
            <line x1="30" y1="45" x2="90" y2="25" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="30" y1="45" x2="90" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <line x1="90" y1="25" x2="160" y2="45" stroke="#00f2fe" strokeWidth="2" />
            <line x1="90" y1="70" x2="160" y2="45" stroke="#10b981" strokeWidth="2" />
            <line x1="160" y1="45" x2="200" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

            {/* Nodes */}
            <circle cx="30" cy="45" r="9" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="90" cy="25" r="10" fill="#00f2fe" />
            <circle cx="90" cy="70" r="10" fill="#10b981" />
            <circle cx="160" cy="45" r="12" fill="#6366f1" stroke="#a855f7" strokeWidth="2" />
            <circle cx="200" cy="30" r="7" fill="#f59e0b" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
          <span>Entities: <strong>5 Personas</strong></span>
          <span>Relationships: <strong>14 Directed</strong></span>
        </div>
      </div>

      {/* Module 4: Tiered Storage Silos (Reference Image 2) */}
      <div
        style={{
          backgroundColor: "rgba(10, 15, 29, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(236, 72, 153, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
            Neo4j Cluster Storage
          </span>
          <span style={{ fontSize: "10.5px", color: "#ec4899", display: "flex", alignItems: "center", gap: "4px" }}>
            <Database size={12} /> In-Memory
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", margin: "14px 0" }}>
          {/* Cyan Silo Stack */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#00f2fe", boxShadow: "0 0 10px rgba(0, 242, 254, 0.5)" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#0284c7" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#0369a1" }} />
            <span style={{ fontSize: "9.5px", color: "var(--text-dim)", marginTop: "4px" }}>TICKETS</span>
          </div>

          {/* Green Silo Stack */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#059669" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#047857" }} />
            <span style={{ fontSize: "9.5px", color: "var(--text-dim)", marginTop: "4px" }}>OUTCOMES</span>
          </div>

          {/* Purple Silo Stack */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#8b5cf6", boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#7c3aed" }} />
            <div style={{ width: "42px", height: "14px", borderRadius: "50%", backgroundColor: "#6d28d9" }} />
            <span style={{ fontSize: "9.5px", color: "var(--text-dim)", marginTop: "4px" }}>ACTIONS</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
          <span>Sync Status</span>
          <span style={{ color: "#10b981", fontWeight: 700 }}>Continuous Bolt</span>
        </div>
      </div>
    </div>
  );
};
