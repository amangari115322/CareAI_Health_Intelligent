"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export default memo(function ServiceNode({ data, selected }: NodeProps) {
  return (
    <div className="relative group" style={{ minWidth: 210, maxWidth: 250 }}>
      {/* 3D depth shadow layers */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none"
        style={{
          background: "rgba(59,130,246,0.18)",
          transform: "translateY(4px) translateX(1px)",
          filter: "blur(6px)",
          borderRadius: 16,
        }}
      />

      {/* Main card */}
      <div
        className={`relative rounded-2xl px-3.5 py-3 transition-all duration-200 border ${
          selected
            ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/30"
            : "border-blue-500/35 hover:border-blue-500/70 hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)]"
        } bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl shadow-sm`}
        style={{
          borderWidth: 1.5,
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-4 right-4 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)",
          }}
        />

        {/* Multi-directional handles for clean orthogonal routing without crossing */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{
            background: "#3b82f6",
            border: "2px solid #93c5fd",
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
            background: "#3b82f6",
            border: "2px solid #93c5fd",
            width: 8,
            height: 8,
            top: -4,
          }}
        />

        {/* Content Header */}
        <div className="flex items-start gap-2.5">
          {data.icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30"
            >
              {data.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Service
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate mt-0.5">
              {data.label}
            </p>
            {data.subtitle && (
              <p className="text-[10px] text-slate-600 dark:text-blue-200/70 mt-0.5 leading-snug line-clamp-2">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Tech Badge */}
        {data.tech && (
          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-blue-500/20 flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate max-w-[140px]">{data.tech}</span>
            </span>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{
            background: "#3b82f6",
            border: "2px solid #93c5fd",
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
            background: "#3b82f6",
            border: "2px solid #93c5fd",
            width: 8,
            height: 8,
            bottom: -4,
          }}
        />
      </div>
    </div>
  );
});
