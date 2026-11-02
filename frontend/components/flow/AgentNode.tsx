"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export default memo(function AgentNode({ data, selected }: NodeProps) {
  return (
    <div className="relative group" style={{ minWidth: 210, maxWidth: 250 }}>
      {/* 3D purple glow depth */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 70%)",
          transform: "translateY(5px) scaleX(0.95)",
          filter: "blur(8px)",
          borderRadius: 16,
        }}
      />

      {/* Main card */}
      <div
        className={`relative rounded-2xl px-3.5 py-3 transition-all duration-200 border ${
          selected
            ? "border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/30"
            : "border-purple-500/40 hover:border-purple-500/70 hover:shadow-[0_4px_16px_rgba(139,92,246,0.25)]"
        } bg-white/95 dark:bg-[#120b22]/95 backdrop-blur-xl shadow-sm`}
        style={{
          borderWidth: 1.5,
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-4 right-4 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)",
          }}
        />

        {/* Pulse indicator dot */}
        <div className="absolute top-2.5 right-2.5 w-2 h-2">
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-60" />
          <div className="relative w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-300" />
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{
            background: "#8b5cf6",
            border: "2px solid #c4b5fd",
            width: 8,
            height: 8,
            left: -4,
          }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            background: "#8b5cf6",
            border: "2px solid #c4b5fd",
            width: 8,
            height: 8,
            top: -4,
          }}
        />

        {/* Content */}
        <div className="flex items-start gap-2.5">
          {data.icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/35"
            >
              {data.icon}
            </div>
          )}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                AI Agent / Model
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate mt-0.5">
              {data.label}
            </p>
            {data.subtitle && (
              <p className="text-[10px] text-slate-600 dark:text-purple-200/70 mt-0.5 leading-snug line-clamp-2">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Tech Badge */}
        {data.tech && (
          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-purple-500/20 flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate max-w-[140px]">{data.tech}</span>
            </span>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{
            background: "#8b5cf6",
            border: "2px solid #c4b5fd",
            width: 8,
            height: 8,
            right: -4,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            background: "#8b5cf6",
            border: "2px solid #c4b5fd",
            width: 8,
            height: 8,
            bottom: -4,
          }}
        />
      </div>
    </div>
  );
});
