"use client";

import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/store";

const STATUS_CONFIG = {
  pending: { color: "bg-slate-400 dark:bg-slate-600", text: "text-slate-500 dark:text-slate-400", glow: "" },
  running: {
    color: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    glow: "shadow-glow-amber",
  },
  done: {
    color: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-glow-green",
  },
  error: { color: "bg-red-500", text: "text-red-700 dark:text-red-400", glow: "" },
};

interface StatusStripProps {
  statuses: AgentStatus[];
}

export default function StatusStrip({ statuses }: StatusStripProps) {
  if (statuses.length === 0) return null;

  const runningAgent = statuses.find((s) => s.status === "running");

  return (
    <div className="glass border border-border rounded-xl p-4 space-y-3">
      {/* Current agent message */}
      {runningAgent && (
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dot-running shrink-0" />
          <span className="text-amber-700 dark:text-amber-300 font-semibold">{runningAgent.agent}:</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{runningAgent.message}</span>
        </div>
      )}

      {/* All agent pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <div
              key={s.agent}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors",
                s.status === "running"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                  : s.status === "done"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-200 dark:border-white/5 bg-slate-100/70 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
              )}
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  cfg.color,
                  s.status === "running" && "dot-running"
                )}
              />
              <span className={cfg.text}>{s.agent}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
