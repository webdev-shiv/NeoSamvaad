import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Play,
  Plus,
  Sparkles,
  Database,
  Table as TableIcon,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Focus,
  Search,
  Check,
  Info,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";
import { apiService } from "../services/api";

export interface GraphNode {
  id: string;
  label: string;
  type: "Customer" | "Ticket" | "Issue" | "Attempt" | "Resolution" | "Product";
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  color: string;
  radius: number;
  properties: Record<string, string | number | boolean>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  color?: string;
}

// Curated aesthetic palette matching NeoSamvaad brand
const NODE_COLORS: Record<string, string> = {
  Customer: "#2563EB",   // Royal Blue
  Ticket: "#7C3AED",     // Vibrant Purple
  Issue: "#D97706",      // Amber Gold
  Attempt: "#DC2626",    // Coral Crimson
  Resolution: "#059669", // Emerald Green
  Product: "#0891B2",    // Cyan Teal
};

const ALL_ENTITY_TYPES: Array<GraphNode["type"]> = [
  "Customer",
  "Ticket",
  "Product",
  "Issue",
  "Attempt",
  "Resolution",
];

// Preset 1: Scenario A (Alice Johnson C-001 traversal)
const PRESET_SCENARIO_A: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    {
      id: "C-001",
      label: "Alice Johnson",
      type: "Customer",
      x: 180,
      y: 260,
      color: NODE_COLORS.Customer,
      radius: 36,
      properties: { customer_id: "C-001", name: "Alice Johnson", tier: "Premium", status: "ACTIVE" },
    },
    {
      id: "T-101",
      label: "Ticket T-101",
      type: "Ticket",
      x: 420,
      y: 200,
      color: NODE_COLORS.Ticket,
      radius: 32,
      properties: { ticket_id: "T-101", status: "OPEN", priority: "HIGH", created_at: "2026-10-10T09:00:00Z" },
    },
    {
      id: "P-LOGIN",
      label: "Auth Service",
      type: "Product",
      x: 640,
      y: 120,
      color: NODE_COLORS.Product,
      radius: 32,
      properties: { product_id: "P-LOGIN", name: "Auth & Identity Service", tier: "Core" },
    },
    {
      id: "I-LOGIN-01",
      label: "Login Failure",
      type: "Issue",
      x: 640,
      y: 280,
      color: NODE_COLORS.Issue,
      radius: 30,
      properties: { issue_id: "I-LOGIN-01", category: "login_failure", severity: "P1" },
    },
    {
      id: "A-101-1",
      label: "Password Reset",
      type: "Attempt",
      x: 880,
      y: 240,
      color: NODE_COLORS.Attempt,
      radius: 30,
      properties: { attempt_id: "A-101-1", method: "password_reset", outcome: "FAILED" },
    },
    {
      id: "R-101-1",
      label: "Unresolved",
      type: "Resolution",
      x: 1100,
      y: 240,
      color: NODE_COLORS.Resolution,
      radius: 30,
      properties: { resolution_id: "R-101-1", status: "UNRESOLVED", action: "issue_unresolved" },
    },
  ],
  edges: [
    { id: "e1", source: "C-001", target: "T-101", type: "REPORTED" },
    { id: "e2", source: "T-101", target: "P-LOGIN", type: "INVOLVES" },
    { id: "e3", source: "T-101", target: "I-LOGIN-01", type: "CONCERNS" },
    { id: "e4", source: "T-101", target: "A-101-1", type: "HAS_ATTEMPT" },
    { id: "e5", source: "A-101-1", target: "R-101-1", type: "RESULTED_IN" },
  ],
};

// Preset 2: Universe constellation
const PRESET_UNIVERSE = (() => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const count = 36;
  const centerX = 600;
  const centerY = 360;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 120 + ((i * 47) % 220);
    const type = ALL_ENTITY_TYPES[i % ALL_ENTITY_TYPES.length];
    const id = `univ-${i + 1}`;
    nodes.push({
      id,
      label: `${type} #${i + 1}`,
      type,
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      color: NODE_COLORS[type],
      radius: type === "Customer" ? 34 : 26,
      properties: { entity_id: id, type, indexed: "2026-10-11" },
    });
    if (i > 0) {
      edges.push({
        id: `u-edge-${i}`,
        source: id,
        target: `univ-${(i % 5) + 1}`,
        type: i % 2 === 0 ? "CONNECTS" : "RELATES_TO",
      });
    }
  }
  return { nodes, edges };
})();

/**
 * Intelligent Column Flow + Anti-Collision Force Relaxation Layout
 * Distributes nodes according to customer support lifecycle without overlapping.
 */
function layoutNodesWithRepulsion(
  rawNodes: Array<{ id: string; label: string; type: string; color?: string; properties?: Record<string, any> }>,
  rawEdges: Array<{ id: string; source: string; target: string; type: string }>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (rawNodes.length === 0) return { nodes: [], edges: [] };

  const total = rawNodes.length;
  // Dynamic virtual canvas dimensions scaled by node count
  const virtualWidth = Math.max(1400, Math.sqrt(total) * 160);
  const virtualHeight = Math.max(820, Math.sqrt(total) * 110);

  // Column x-anchors for hierarchical GraphRAG traversal flow
  const columnX: Record<string, number> = {
    Customer: virtualWidth * 0.12,
    Ticket: virtualWidth * 0.32,
    Product: virtualWidth * 0.52,
    Issue: virtualWidth * 0.52,
    Attempt: virtualWidth * 0.72,
    Resolution: virtualWidth * 0.90,
  };

  // Group nodes by entity type to space them along their column
  const grouped: Record<string, typeof rawNodes> = {
    Customer: [],
    Ticket: [],
    Product: [],
    Issue: [],
    Attempt: [],
    Resolution: [],
  };

  rawNodes.forEach((n) => {
    const t = n.type in grouped ? n.type : "Issue";
    grouped[t].push(n);
  });

  const nodeMap = new Map<string, GraphNode>();

  Object.entries(grouped).forEach(([type, list]) => {
    const baseColX = columnX[type] || virtualWidth * 0.5;
    const len = list.length;
    list.forEach((rn, idx) => {
      // Stagger vertical placement evenly across column height
      const stepY = len <= 1 ? virtualHeight * 0.5 : (virtualHeight * 0.76) / Math.max(1, len - 1);
      const startY = virtualHeight * 0.14;
      const initialY = startY + idx * stepY;
      // Alternate slight horizontal offset to create natural readable honeycomb spacing
      const offsetX = (idx % 2 === 0 ? -1 : 1) * ((idx * 17) % 36);

      const r = rn.type === "Customer" ? 34 : rn.type === "Ticket" ? 30 : 26;
      const color = rn.color || NODE_COLORS[rn.type] || "#64748B";

      nodeMap.set(rn.id, {
        id: rn.id,
        label: rn.label,
        type: (rn.type as any) || "Issue",
        x: baseColX + offsetX,
        y: initialY,
        vx: 0,
        vy: 0,
        color,
        radius: r,
        properties: rn.properties || { id: rn.id, type: rn.type },
      });
    });
  });

  const nodes = Array.from(nodeMap.values());

  // Fast Anti-Collision Relaxation (Coulomb repulsion pushback)
  const iterations = Math.min(60, 20 + Math.floor(nodes.length / 2));
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = a.radius + b.radius + 26; // Generous safety buffer

        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = (dx / dist) * overlap;
          const ny = (dy / dist) * overlap;

          // Push apart
          a.x -= nx;
          a.y -= ny;
          b.x += nx;
          b.y += ny;

          // Bound inside virtual canvas
          a.x = Math.max(a.radius + 20, Math.min(virtualWidth - a.radius - 20, a.x));
          a.y = Math.max(a.radius + 20, Math.min(virtualHeight - a.radius - 20, a.y));
          b.x = Math.max(b.radius + 20, Math.min(virtualWidth - b.radius - 20, b.x));
          b.y = Math.max(b.radius + 20, Math.min(virtualHeight - b.radius - 20, b.y));
        }
      }
    }
  }

  const edges: GraphEdge[] = rawEdges.map((re, idx) => ({
    id: re.id || `e-live-${idx}`,
    source: re.source,
    target: re.target,
    type: re.type,
  }));

  return { nodes, edges };
}

export const Neo4jLiveGraph: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"graph" | "table" | "raw">("graph");
  const [preset, setPreset] = useState<"live" | "scenarioA" | "universe">("live");
  const [nodes, setNodes] = useState<GraphNode[]>(PRESET_SCENARIO_A.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(PRESET_SCENARIO_A.edges);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(PRESET_SCENARIO_A.nodes[0]);
  const [isPulseActive, setIsPulseActive] = useState<boolean>(true);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Pan & Zoom Engine
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTypeFilters, setActiveTypeFilters] = useState<Set<string>>(
    new Set(ALL_ENTITY_TYPES)
  );

  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveStats, setLiveStats] = useState<{ nodes: number; edges: number; connected: boolean }>({
    nodes: 0,
    edges: 0,
    connected: false,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Live AuraDB Data
  const loadLiveGraphData = async () => {
    setIsLiveLoading(true);
    try {
      const data = await apiService.fetchLiveGraph(80);
      const layout = layoutNodesWithRepulsion(data.nodes, data.edges);
      setNodes(layout.nodes);
      setEdges(layout.edges);
      if (layout.nodes.length > 0) {
        setSelectedNode(layout.nodes[0]);
      }
      setLiveStats({
        nodes: data.total_nodes,
        edges: data.total_edges,
        connected: data.neo4j_connected,
      });
      // Auto-fit newly loaded nodes nicely
      setTimeout(() => fitToScreenWithNodes(layout.nodes), 50);
    } catch (err) {
      console.warn("Could not fetch live graph, falling back to Scenario A", err);
      setNodes(PRESET_SCENARIO_A.nodes.map((n) => ({ ...n })));
      setEdges(PRESET_SCENARIO_A.edges);
      setSelectedNode(PRESET_SCENARIO_A.nodes[0]);
    } finally {
      setIsLiveLoading(false);
    }
  };

  // Preset switching
  useEffect(() => {
    if (preset === "live") {
      loadLiveGraphData();
    } else if (preset === "scenarioA") {
      setNodes(PRESET_SCENARIO_A.nodes.map((n) => ({ ...n })));
      setEdges(PRESET_SCENARIO_A.edges);
      setSelectedNode(PRESET_SCENARIO_A.nodes[0]);
      setTimeout(() => fitToScreenWithNodes(PRESET_SCENARIO_A.nodes), 50);
    } else {
      setNodes(PRESET_UNIVERSE.nodes.map((n) => ({ ...n })));
      setEdges(PRESET_UNIVERSE.edges);
      setSelectedNode(PRESET_UNIVERSE.nodes[0]);
      setTimeout(() => fitToScreenWithNodes(PRESET_UNIVERSE.nodes), 50);
    }
  }, [preset]);

  // Fit to screen helper
  const fitToScreenWithNodes = (targetNodes: GraphNode[]) => {
    if (!containerRef.current || targetNodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerW = rect.width || 900;
    const containerH = rect.height || 480;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    targetNodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const graphW = Math.max(100, maxX - minX + 100);
    const graphH = Math.max(100, maxY - minY + 100);

    const fitZoom = Math.max(0.4, Math.min(1.2, Math.min((containerW - 80) / graphW, (containerH - 80) / graphH)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoomLevel(fitZoom);
    setPan({
      x: containerW / 2 - centerX * fitZoom,
      y: containerH / 2 - centerY * fitZoom,
    });
  };

  const fitToScreen = () => {
    fitToScreenWithNodes(visibleNodes);
  };

  const resetView = () => {
    setZoomLevel(0.85);
    setPan({ x: 20, y: 10 });
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(2.5, +(z + 0.15).toFixed(2)));
  const zoomOut = () => setZoomLevel((z) => Math.max(0.35, +(z - 0.15).toFixed(2)));

  // Wheel zoom around center
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.max(0.35, Math.min(2.5, +(prev * zoomFactor).toFixed(2))));
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === "rect") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Node Dragging Handlers in Scaled Pan Space
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    const n = nodes.find((item) => item.id === nodeId);
    if (n) setSelectedNode(n);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (draggedNodeId && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoomLevel;
        const mouseY = (e.clientY - rect.top - pan.y) / zoomLevel;

        setNodes((prev) =>
          prev.map((n) => (n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY } : n))
        );
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [draggedNodeId, isPanning, pan.x, pan.y, panStart.x, panStart.y, zoomLevel]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNodeId(null);
    setIsPanning(false);
  }, []);

  // Filter nodes & edges
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      const typeMatch = activeTypeFilters.has(n.type);
      if (!typeMatch) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q) || n.type.toLowerCase().includes(q);
    });
  }, [nodes, activeTypeFilters, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  // Selected node neighborhood highlighting
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>([selectedNode.id]);
    edges.forEach((e) => {
      if (e.source === selectedNode.id) ids.add(e.target);
      if (e.target === selectedNode.id) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, edges]);

  const toggleTypeFilter = (type: GraphNode["type"]) => {
    setActiveTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type); // Keep at least one
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const cypherQuery =
    preset === "live"
      ? `neo4j$ MATCH (c:Customer)-[:REPORTED]->(t:Ticket)-[:HAS_ATTEMPT]->(a:Attempt)-[:RESULTED_IN]->(r:Resolution)\n       OPTIONAL MATCH (t)-[:CONCERNS]->(i:Issue)\n       RETURN c, t, a, r, i LIMIT 80;`
      : preset === "scenarioA"
      ? `neo4j$ MATCH (c:Customer {customer_id: 'C-001'})-[r1:REPORTED]->(t:Ticket)\n       OPTIONAL MATCH (t)-[r2:CONCERNS]->(i:Issue)\n       OPTIONAL MATCH (t)-[r3:HAS_ATTEMPT]->(a:Attempt)-[r4:RESULTED_IN]->(r:Resolution)\n       RETURN c, t, i, a, r;`
      : `neo4j$ MATCH (n) WHERE n:Customer OR n:Product OR n:Issue OR n:Ticket OR n:Attempt OR n:Resolution\n       MATCH (n)-[r]->(m)\n       RETURN n, r, m LIMIT 50;`;

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(cypherQuery);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Add Test Node
  const handleAddLiveNode = () => {
    const newId = `T-${Date.now().toString(36).toUpperCase()}`;
    const targetNode = visibleNodes[Math.floor(Math.random() * visibleNodes.length)] || nodes[0];
    if (!targetNode) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 120;
    const type: GraphNode["type"] = "Attempt";

    const newNode: GraphNode = {
      id: newId,
      label: `Test Attempt #${nodes.length + 1}`,
      type,
      x: targetNode.x + Math.cos(angle) * dist,
      y: targetNode.y + Math.sin(angle) * dist,
      color: NODE_COLORS[type],
      radius: 28,
      properties: {
        attempt_id: newId,
        method: "diagnostic_inspect",
        outcome: "IN_PROGRESS",
        timestamp: new Date().toISOString(),
      },
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [
      ...prev,
      { id: `e-${newId}`, source: targetNode.id, target: newId, type: "TEST_LINKED" },
    ]);
    setSelectedNode(newNode);
  };

  // Write demo issue to real Neo4j AuraDB
  const handleReportLiveIssue = async () => {
    try {
      const res = await apiService.reportIssue({
        customer_id: "DEMO-LIVE-TEST",
        product_id: "P-LOGIN",
        issue_description: "Live demo issue reported from UI graph canvas",
        category: "auth_token_expired",
        attempt_method: "reauth_token",
        attempt_outcome: "FAILED",
        attempt_notes: "OAuth session token invalid",
        resolution_status: "UNRESOLVED",
      });
      alert(`Persisted in Neo4j AuraDB!\nTicket: ${res.ticket_id}\nAttempt: ${res.attempt_id} (FAILED)\nResolution: UNRESOLVED`);
      await loadLiveGraphData();
    } catch (e) {
      alert("Error reporting issue: " + e);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface-white)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-neutral-border)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : 1,
        height: isFullscreen ? "100vh" : undefined,
      }}
    >
      {/* Top Cypher Console Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          backgroundColor: "#161b22",
          color: "#e6edf3",
          borderBottom: "1px solid #30363d",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "12px",
          overflowX: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <span style={{ color: "#58a6ff", fontWeight: 700, flexShrink: 0 }}>neo4j$</span>
          <span style={{ color: "#7ee787", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cypherQuery.split("\n")[0]}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "14px" }}>
          <button
            onClick={handleCopyQuery}
            title="Copy Cypher Query"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#e6edf3",
              borderRadius: "var(--radius-xs)",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {copiedQuery ? <Check size={12} color="#34d399" /> : <Code2 size={12} />}
            <span>{copiedQuery ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={() => setIsPulseActive((prev) => !prev)}
            title="Toggle Traversal Pulse"
            style={{
              background: isPulseActive ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#ffffff",
              borderRadius: "var(--radius-xs)",
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Play size={11} />
            <span>{isPulseActive ? "Live Wave" : "Play Wave"}</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          backgroundColor: "#FBFBFA", // aesthetic cream white bar
          borderBottom: "1px solid #E2E8F0",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Tabs: Graph | Table | Raw */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => setActiveTab("graph")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: activeTab === "graph" ? "#ffffff" : "transparent",
              border: activeTab === "graph" ? "1px solid #CBD5E1" : "1px solid transparent",
              color: activeTab === "graph" ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "graph" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Database size={13} />
            <span>Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("table")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: activeTab === "table" ? "#ffffff" : "transparent",
              border: activeTab === "table" ? "1px solid #CBD5E1" : "1px solid transparent",
              color: activeTab === "table" ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "table" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <TableIcon size={13} />
            <span>Table</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: activeTab === "raw" ? "#ffffff" : "transparent",
              border: activeTab === "raw" ? "1px solid #CBD5E1" : "1px solid transparent",
              color: activeTab === "raw" ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "raw" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Code2 size={13} />
            <span>Raw</span>
          </button>
        </div>

        {/* Source Selector & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--color-text-secondary)" }}>
            <span style={{ fontWeight: 600 }}>Source:</span>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as "live" | "scenarioA" | "universe")}
              style={{
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-primary)",
                color: "var(--color-text-primary)",
                fontSize: "12px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="live">🌐 Live Neo4j AuraDB ({liveStats.nodes || "140+"} Nodes Streamed)</option>
              <option value="scenarioA">Scenario A: Failed Action Traversal (Alice C-001)</option>
              <option value="universe">Interactive Graph Constellation</option>
            </select>
          </div>

          {preset === "live" && (
            <button
              onClick={loadLiveGraphData}
              disabled={isLiveLoading}
              title="Fetch latest graph nodes and relationships from Neo4j AuraDB"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-primary-light)",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: isLiveLoading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw size={13} className={isLiveLoading ? "spin-animation" : ""} />
              <span>{isLiveLoading ? "Syncing..." : "Sync AuraDB"}</span>
            </button>
          )}

          <button
            onClick={handleAddLiveNode}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#ffffff",
              border: "1px solid #CBD5E1",
              color: "var(--color-text-secondary)",
              fontSize: "11.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={13} />
            <span>Add Test Node</span>
          </button>

          {preset === "live" && (
            <button
              onClick={handleReportLiveIssue}
              title="Report issue and persist directly to Neo4j AuraDB"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Sparkles size={12} />
              <span>Write Demo Issue</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      {activeTab === "graph" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 18px",
            backgroundColor: "#F7F6F0", // cream background
            borderBottom: "1px solid #E2E8F0",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Entity Type Filter Toggles */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={11} /> Filter:
            </span>
            {ALL_ENTITY_TYPES.map((type) => {
              const active = activeTypeFilters.has(type);
              const color = NODE_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    border: `1px solid ${active ? color : "#CBD5E1"}`,
                    backgroundColor: active ? `${color}15` : "#ffffff",
                    color: active ? color : "#94A3B8",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: active ? color : "#CBD5E1",
                    }}
                  />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 8px",
                backgroundColor: "#ffffff",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
              }}
            >
              <Search size={12} color="#64748B" />
              <input
                type="text"
                placeholder="Search nodes by ID/label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "11.5px",
                  color: "#1E293B",
                  background: "transparent",
                  width: "180px",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
              {visibleNodes.length} nodes
            </span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flex: 1,
          height: isFullscreen ? "calc(100vh - 120px)" : "520px",
          position: "relative",
          backgroundColor: "#FBFBFA", // aesthetic cream white canvas!
        }}
      >
        {activeTab === "graph" ? (
          <>
            {/* Interactive SVG Canvas */}
            <div
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: "#FDFCF7", // warm, aesthetic cream white!
                overflow: "hidden",
                cursor: isPanning ? "grabbing" : draggedNodeId ? "grabbing" : "grab",
              }}
            >
              {/* Floating Navigation Controls Toolbar */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "4px 6px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <button
                  onClick={zoomIn}
                  title="Zoom In"
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={zoomOut}
                  title="Zoom Out"
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <ZoomOut size={14} />
                </button>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    padding: "0 6px",
                    userSelect: "none",
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={fitToScreen}
                  title="Fit to Screen"
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <Focus size={14} />
                </button>
                <button
                  onClick={resetView}
                  title="Reset View"
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>

              {/* Status Hint */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  fontSize: "11px",
                  color: "#64748B",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #E2E8F0",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  pointerEvents: "none",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <Sparkles size={12} color="var(--color-primary)" />
                <span>Drag nodes freely • Pan canvas • Scroll to zoom</span>
              </div>

              {/* Interactive SVG Canvas */}
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#FDFCF7", // warm cream-white
                }}
              >
                <defs>
                  {/* Subtle slate dot-grid pattern for cream background */}
                  <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="12" r="1.1" fill="#E2E8F0" />
                  </pattern>
                  {/* Arrow markers */}
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
                  </marker>
                  <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
                  </marker>
                </defs>

                {/* Dot grid background */}
                <rect width="100%" height="100%" fill="url(#dot-grid)" />

                {/* Scaled & Panned Graph Container */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}>
                  {/* Edges */}
                  {visibleEdges.map((edge) => {
                    const src = nodes.find((n) => n.id === edge.source);
                    const tgt = nodes.find((n) => n.id === edge.target);
                    if (!src || !tgt) return null;

                    const isEdgeConnectedToSelected =
                      selectedNode && (src.id === selectedNode.id || tgt.id === selectedNode.id);
                    const isEdgeHovered =
                      src.id === hoveredNodeId || tgt.id === hoveredNodeId;

                    const opacity =
                      selectedNode
                        ? isEdgeConnectedToSelected
                          ? 1
                          : 0.15
                        : 0.85;

                    const midX = (src.x + tgt.x) / 2;
                    const midY = (src.y + tgt.y) / 2;

                    return (
                      <g key={edge.id} style={{ opacity, transition: "opacity 0.2s ease" }}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isEdgeConnectedToSelected || isEdgeHovered ? "#2563EB" : "#CBD5E1"}
                          strokeWidth={isEdgeConnectedToSelected ? 2.5 : 1.5}
                          strokeDasharray={isPulseActive ? "4 3" : "none"}
                          markerEnd={isEdgeConnectedToSelected ? "url(#arrow-active)" : "url(#arrow)"}
                        />
                        {/* Edge Label Pill (shown unless zoomed way out) */}
                        {zoomLevel >= 0.55 && (
                          <g>
                            <rect
                              x={midX - 32}
                              y={midY - 9}
                              width={64}
                              height={18}
                              rx={9}
                              fill="#ffffff"
                              stroke="#CBD5E1"
                              strokeWidth={1}
                              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                            />
                            <text
                              x={midX}
                              y={midY + 3.5}
                              textAnchor="middle"
                              fill="#475569"
                              fontSize={8.5}
                              fontFamily="monospace"
                              fontWeight={700}
                              style={{ userSelect: "none", pointerEvents: "none" }}
                            >
                              {edge.type.length > 12 ? edge.type.slice(0, 11) + "…" : edge.type}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {visibleNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isConnected = !selectedNode || connectedNodeIds.has(node.id);
                    const opacity = isConnected ? 1 : 0.22;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        style={{
                          cursor: "pointer",
                          opacity,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {/* Outer Selection Glow */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={node.radius + 7}
                            fill="none"
                            stroke={node.color}
                            strokeWidth={3}
                            strokeOpacity={0.7}
                            strokeDasharray="4 2"
                          />
                        )}

                        {/* Main Node Circle */}
                        <circle
                          r={node.radius}
                          fill={node.color}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 3 : 2}
                          style={{
                            filter: isSelected
                              ? "drop-shadow(0 0 10px rgba(37,99,235,0.4))"
                              : "drop-shadow(0 2px 6px rgba(0,0,0,0.12))",
                            transition: "all 0.15s ease",
                          }}
                        />

                        {/* Node Label Text */}
                        <text
                          textAnchor="middle"
                          dy={node.radius > 28 ? "-2" : "3"}
                          fill="#ffffff"
                          fontSize={node.radius > 28 ? 10 : 8.5}
                          fontWeight={700}
                          style={{ userSelect: "none", pointerEvents: "none" }}
                        >
                          {node.label.length > 12 ? node.label.slice(0, 11) + "…" : node.label}
                        </text>

                        {/* Type subtext */}
                        {node.radius > 28 && zoomLevel >= 0.65 && (
                          <text
                            textAnchor="middle"
                            dy="12"
                            fill="rgba(255, 255, 255, 0.85)"
                            fontSize={7.5}
                            fontWeight={600}
                            style={{ userSelect: "none", pointerEvents: "none" }}
                          >
                            :{node.type}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Right Drawer: Clean Node Inspector */}
            <div
              style={{
                width: "290px",
                borderLeft: "1px solid #E2E8F0",
                backgroundColor: "#ffffff",
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "-2px 0 10px rgba(0,0,0,0.02)",
              }}
            >
              {selectedNode ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: selectedNode.color,
                        }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748B" }}>
                        Node Details
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      title="Clear Selection"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94A3B8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#0F172A",
                        wordBreak: "break-word",
                        lineHeight: 1.3,
                      }}
                    >
                      {selectedNode.label}
                    </h4>
                  </div>

                  {/* Node Type & ID Badges */}
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        backgroundColor: `${selectedNode.color}15`,
                        border: `1px solid ${selectedNode.color}40`,
                        color: selectedNode.color,
                        padding: "2px 8px",
                        borderRadius: "9999px",
                      }}
                    >
                      :{selectedNode.type}
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        backgroundColor: "#F1F5F9",
                        border: "1px solid #E2E8F0",
                        color: "#475569",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                      }}
                    >
                      id: {selectedNode.id}
                    </span>
                  </div>

                  {/* Properties Table */}
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
                      Properties ({Object.keys(selectedNode.properties).length}):
                    </span>
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        overflow: "hidden",
                      }}
                    >
                      {Object.entries(selectedNode.properties).map(([k, v], idx) => (
                        <div
                          key={k}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            fontSize: "11px",
                            borderBottom:
                              idx < Object.keys(selectedNode.properties).length - 1 ? "1px solid #E2E8F0" : "none",
                          }}
                        >
                          <span style={{ color: "#64748B", fontFamily: "monospace" }}>{k}</span>
                          <span style={{ fontWeight: 600, color: "#1E293B", fontFamily: "monospace", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Relationships */}
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
                      Connected Relationships:
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {edges
                        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((e) => {
                          const isOutgoing = e.source === selectedNode.id;
                          const otherId = isOutgoing ? e.target : e.source;
                          const otherNode = nodes.find((n) => n.id === otherId);

                          return (
                            <div
                              key={e.id}
                              onClick={() => otherNode && setSelectedNode(otherNode)}
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                borderRadius: "6px",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ color: isOutgoing ? "#2563EB" : "#D97706", fontWeight: 700 }}>
                                {isOutgoing ? "→" : "←"}
                              </span>
                              <span style={{ color: "#0891B2", fontFamily: "monospace", fontSize: "10px", fontWeight: 700 }}>
                                :{e.type}
                              </span>
                              <span style={{ color: "#334155", marginLeft: "auto", fontSize: "10.5px", fontWeight: 600 }}>
                                {otherNode?.label || otherId}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#94A3B8", marginTop: "40px", fontSize: "12px" }}>
                  <Info size={24} style={{ margin: "0 auto 8px" }} />
                  <div>Click any node on the cream graph canvas to inspect its properties and connected path.</div>
                </div>
              )}
            </div>
          </>
        ) : activeTab === "table" ? (
          /* Table View Tab */
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", backgroundColor: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
                  <th style={{ padding: "8px 12px" }}>ID</th>
                  <th style={{ padding: "8px 12px" }}>Label</th>
                  <th style={{ padding: "8px 12px" }}>Entity Type</th>
                  <th style={{ padding: "8px 12px" }}>Properties</th>
                </tr>
              </thead>
              <tbody>
                {visibleNodes.map((n) => (
                  <tr
                    key={n.id}
                    onClick={() => {
                      setSelectedNode(n);
                      setActiveTab("graph");
                    }}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      cursor: "pointer",
                      backgroundColor: selectedNode?.id === n.id ? "#EFF6FF" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#2563EB" }}>{n.id}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1E293B" }}>{n.label}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          backgroundColor: `${n.color}15`,
                          color: n.color,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontWeight: 700,
                          fontSize: "10.5px",
                        }}
                      >
                        :{n.type}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: "11px", color: "#64748B" }}>
                      {JSON.stringify(n.properties)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Raw Cypher / JSON View Tab */
          <div style={{ flex: 1, padding: "16px", backgroundColor: "#1E293B", overflowY: "auto" }}>
            <pre style={{ margin: 0, fontFamily: "ui-monospace, monospace", fontSize: "11.5px", color: "#86EFAC", lineHeight: "1.6" }}>
              {JSON.stringify(
                {
                  query: cypherQuery,
                  total_visible: visibleNodes.length,
                  results: [
                    {
                      nodes: visibleNodes.map((n) => ({ id: n.id, labels: [n.type], properties: n.properties })),
                      relationships: visibleEdges.map((e) => ({ id: e.id, type: e.type, source: e.source, target: e.target })),
                    },
                  ],
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Neo4jLiveGraph;
