"use client";

import { X, Cpu, Database, Zap, Code2, BookOpen, Layers } from "lucide-react";
import type { Node } from "reactflow";

interface Props {
  node: Node;
  onClose: () => void;
}

const TYPE_CONFIG = {
  agentNode: {
    label: "AI Agent / Model",
    accentColor: "#8b5cf6",
    badgeBg: "rgba(139,92,246,0.15)",
    textColor: "#c4b5fd",
    borderColor: "rgba(168,85,247,0.35)",
    icon: Zap,
  },
  dataNode: {
    label: "Data Store / Pipeline",
    accentColor: "#06b6d4",
    badgeBg: "rgba(6,182,212,0.15)",
    textColor: "#67e8f9",
    borderColor: "rgba(6,182,212,0.35)",
    icon: Database,
  },
  serviceNode: {
    label: "Application Service",
    accentColor: "#3b82f6",
    badgeBg: "rgba(59,130,246,0.15)",
    textColor: "#93c5fd",
    borderColor: "rgba(59,130,246,0.35)",
    icon: Cpu,
  },
};

export default function NodeDetailDrawer({ node, onClose }: Props) {
  const d = node.data;
  const cfg = TYPE_CONFIG[node.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.serviceNode;
  const Icon = cfg.icon;

  return (
    <div
      className="absolute top-3 right-3 bottom-3 w-80 rounded-2xl flex flex-col z-30 overflow-hidden shadow-2xl animate-slide-in-right bg-white/95 dark:bg-[#0a0a18]/95 border border-slate-200 dark:border-white/10 backdrop-blur-xl"
      style={{
        boxShadow: `0 0 0 1px ${cfg.accentColor}22, 0 20px 50px rgba(0,0,0,0.25)`,
      }}
    >
      {/* Top accent line */}
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.accentColor}, transparent)`,
        }}
      />

      {/* Header */}
      <div
        className="flex items-start gap-3 p-4 shrink-0 border-b border-slate-200 dark:border-white/8"
        style={{
          background: `linear-gradient(180deg, ${cfg.accentColor}12 0%, transparent 100%)`,
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
          style={{
            background: `${cfg.accentColor}20`,
            border: `1px solid ${cfg.borderColor}`,
          }}
        >
          {d.icon || <Icon size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: cfg.badgeBg, color: cfg.accentColor }}
            >
              {cfg.label}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate mt-1">
            {d.label}
          </h3>
          {d.subtitle && (
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
              {d.subtitle}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
          title="Close inspector"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-slate-800 dark:text-slate-200">
        {/* Technology Stack */}
        {d.tech && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/6 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Code2 size={11} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Technology / Library
              </span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: cfg.badgeBg,
                border: `1px solid ${cfg.borderColor}`,
                color: cfg.accentColor,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.accentColor }} />
              {d.tech}
            </span>
          </div>
        )}

        {/* Responsibility */}
        {d.responsibility && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/6 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <BookOpen size={11} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Role & Responsibility
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {d.responsibility}
            </p>
          </div>
        )}

        {/* Node Metadata Pill */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/6 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-slate-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Graph Position & ID
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>Node ID: <code className="text-slate-700 dark:text-slate-300 font-bold">{node.id}</code></span>
            <span>X: {Math.round(node.position.x)}, Y: {Math.round(node.position.y)}</span>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-200 dark:border-white/8 text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono">
        Drag node on canvas to reposition
      </div>
    </div>
  );
}
