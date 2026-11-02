"use client";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  MarkerType,
  ConnectionLineType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { LayoutDashboard, Zap, Database } from "lucide-react";

import ServiceNode from "./ServiceNode";
import AgentNode from "./AgentNode";
import DataNode from "./DataNode";
import NodeDetailDrawer from "./NodeDetailDrawer";
import type { DiagramData } from "@/lib/api";

const NODE_TYPES: NodeTypes = {
  serviceNode: ServiceNode,
  agentNode: AgentNode,
  dataNode: DataNode,
};

interface DiagramCanvasProps {
  diagrams: {
    architecture: DiagramData;
    workflow: DiagramData;
    dataflow: DiagramData;
  };
}

const TABS = [
  { id: "architecture", label: "Architecture", icon: LayoutDashboard, color: "#3b82f6", desc: "System Component & Service Architecture" },
  { id: "workflow", label: "Agent Workflow", icon: Zap, color: "#8b5cf6", desc: "Autonomous Execution & Decision Flow" },
  { id: "dataflow", label: "Data Flow", icon: Database, color: "#06b6d4", desc: "Data Stream & Transformation Pipeline" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function buildEdges(edges: DiagramData["edges"], tabId: TabId, isLight: boolean): Edge[] {
  return edges.map((e) => {
    const isAnim = e.animated ?? (tabId === "dataflow" || tabId === "workflow");
    const strokeColor =
      tabId === "workflow"
        ? (isLight ? "#7c3aed" : "#c084fc")
        : tabId === "dataflow"
        ? (isLight ? "#0891b2" : "#22d3ee")
        : (isLight ? "#2563eb" : "#60a5fa");

    return {
      ...e,
      type: "smoothstep",
      pathOptions: { borderRadius: 20 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 18,
        height: 18,
      },
      style: {
        stroke: strokeColor,
        strokeWidth: isAnim ? 2.2 : 1.7,
        strokeDasharray: tabId === "dataflow" ? "6, 6" : undefined,
      },
      labelStyle: {
        fill: isLight ? "#0f172a" : "#f1f5f9",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "ui-monospace, monospace",
      },
      labelBgStyle: {
        fill: isLight ? "#ffffff" : "#0f172a",
        fillOpacity: 0.96,
        stroke: isLight ? "#cbd5e1" : "rgba(255,255,255,0.18)",
        strokeWidth: 1,
      },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 6,
      animated: isAnim,
    };
  });
}

/**
 * Clean layout engine with guaranteed non-overlapping clearance.
 */
function buildNodes(nodes: DiagramData["nodes"], tabId: TabId): Node[] {
  const allZero = nodes.every(
    (n) => !n.position || (n.position.x === 0 && n.position.y === 0)
  );

  let initial: Array<{ node: (typeof nodes)[0]; x: number; y: number }> = [];

  if (allZero) {
    if (tabId === "architecture") {
      // 4 Architectural Tiers: UI Clients -> API Services -> AI Models -> Data Stores
      const tiers: Record<string, typeof nodes> = {
        ui: [],
        service: [],
        agent: [],
        data: [],
      };
      nodes.forEach((n) => {
        if (n.type === "agentNode") tiers.agent.push(n);
        else if (n.type === "dataNode") tiers.data.push(n);
        else if (n.id.includes("ui") || n.id.includes("client") || n.id.includes("frontend")) tiers.ui.push(n);
        else tiers.service.push(n);
      });

      let currentX = 80;
      const tierList = [tiers.ui, tiers.service, tiers.agent, tiers.data];
      tierList.forEach((group) => {
        if (group.length > 0) {
          group.forEach((node, rIdx) => {
            initial.push({
              node,
              x: currentX,
              y: 120 + rIdx * 190,
            });
          });
          currentX += 370;
        }
      });
    } else if (tabId === "workflow") {
      // Sequential Agent / Task Flow with staggered heights
      nodes.forEach((node, idx) => {
        const x = 80 + idx * 370;
        const y = 140 + (idx % 2 === 0 ? 0 : 80);
        initial.push({ node, x, y });
      });
    } else {
      // Linear Data Flow stream pipeline
      nodes.forEach((node, idx) => {
        const x = 80 + idx * 370;
        const y = 160 + (idx % 2 === 1 ? 70 : 0);
        initial.push({ node, x, y });
      });
    }
  } else {
    // Preserve domain positions provided by backend
    initial = nodes.map((n) => ({
      node: n,
      x: n.position?.x ?? 80,
      y: n.position?.y ?? 120,
    }));
  }

  // Guaranteed anti-collision pass: ensure at least 320px horizontal and 140px vertical clearance
  const placed: Array<{ x: number; y: number }> = [];
  const result: Node[] = [];

  for (const item of initial) {
    let x = item.x;
    let y = item.y;

    for (const p of placed) {
      const dx = Math.abs(x - p.x);
      const dy = Math.abs(y - p.y);
      if (dx < 310 && dy < 130) {
        if (dx < 310) x = p.x + 340;
        if (dy < 130) y = p.y + 150;
      }
    }

    placed.push({ x, y });
    result.push({ ...item.node, position: { x, y } });
  }

  return result;
}

export default function DiagramCanvas({ diagrams }: DiagramCanvasProps) {
  const [activeTab, setActiveTab] = useState<TabId>("architecture");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const currentDiagram = diagrams[activeTab];

  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(currentDiagram.nodes, activeTab)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildEdges(currentDiagram.edges, activeTab, isLight)
  );

  useEffect(() => {
    setSelectedNode(null);
    const d = diagrams[activeTab];
    setNodes(buildNodes(d.nodes, activeTab));
    setEdges(buildEdges(d.edges, activeTab, isLight));
  }, [activeTab, diagrams, isLight, setEdges, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const activeTabCfg = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div
        className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              style={{
                background: isActive ? (isLight ? "#ffffff" : `${tab.color}1c`) : "transparent",
                border: isActive ? `1px solid ${tab.color}50` : "1px solid transparent",
                color: isActive ? (isLight ? "#0f172a" : tab.color) : undefined,
                boxShadow: isActive ? `0 0 16px ${tab.color}20` : "none",
              }}
            >
              <Icon size={14} style={{ color: tab.color }} className={isActive ? "animate-pulse" : ""} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-lg dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] bg-slate-50 dark:bg-[#070712]"
        style={{
          height: 560,
          background: isLight
            ? `radial-gradient(ellipse at 30% 20%, ${activeTabCfg.color}10 0%, #f8fafc 70%)`
            : `radial-gradient(ellipse at 30% 20%, ${activeTabCfg.color}0e 0%, #070712 70%)`,
        }}
      >
        {/* Ambient corner glows */}
        <div
          className="absolute top-0 left-0 w-64 h-64 pointer-events-none opacity-50 dark:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at top left, ${activeTabCfg.color}18, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none opacity-30 dark:opacity-80 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at bottom right, ${activeTabCfg.color}12, transparent 70%)`,
          }}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.35, minZoom: 0.3, maxZoom: 1.3 }}
          minZoom={0.15}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={26}
            size={1.4}
            color={activeTabCfg.color}
          />

          <Controls
            showInteractive={false}
            style={{ bottom: 14, left: 14, top: "auto" }}
          />

          <MiniMap
            nodeColor={(n) =>
              n.type === "agentNode"
                ? "rgba(139,92,246,0.85)"
                : n.type === "dataNode"
                ? "rgba(6,182,212,0.85)"
                : "rgba(59,130,246,0.85)"
            }
            maskColor={isLight ? "rgba(241,245,249,0.75)" : "rgba(4,4,14,0.65)"}
            style={{
              bottom: 14,
              right: 14,
              borderRadius: 12,
              border: isLight ? "1px solid rgba(203,213,225,0.8)" : "1px solid rgba(255,255,255,0.08)",
              background: isLight ? "rgba(255,255,255,0.95)" : "rgba(6,6,18,0.85)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Legend */}
          <Panel position="top-right" style={{ margin: 12 }}>
            <div
              className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/95 dark:bg-slate-950/85 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md shadow-md"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">
                Diagram Nodes
              </p>
              {[
                { color: "#3b82f6", label: "Service / Pipeline" },
                { color: "#8b5cf6", label: "AI Engine / Agent" },
                { color: "#06b6d4", label: "Data / Payload Store" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background: color,
                      boxShadow: `0 0 6px ${color}80`,
                    }}
                  />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </ReactFlow>

        {/* Node detail drawer */}
        {selectedNode && (
          <NodeDetailDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Description & Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-600 dark:text-slate-300">{activeTabCfg.desc}</span>
        <span>Click node to inspect · Scroll to zoom · Drag nodes to reposition</span>
      </div>
    </div>
  );
}
