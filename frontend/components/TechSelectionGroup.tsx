"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  Star,
  Plus,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TechCategory } from "@/lib/api";

interface TechSelectionGroupProps {
  categories: TechCategory[];
  onToggle: (categoryId: string, techName: string) => void;
  onAddCustom: (categoryId: string, name: string) => void;
  isUpdating?: boolean;
}

export default function TechSelectionGroup({
  categories,
  onToggle,
  onAddCustom,
  isUpdating,
}: TechSelectionGroupProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [activeInputCat, setActiveInputCat] = useState<string | null>(null);

  const toggleCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleAddSubmit = (catId: string) => {
    const val = customInputs[catId]?.trim();
    if (val) {
      onAddCustom(catId, val);
      setCustomInputs((prev) => ({ ...prev, [catId]: "" }));
      setActiveInputCat(null);
    }
  };

  const totalSelected = categories.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.selected).length,
    0
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Overview header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border border-border backdrop-blur-md">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={18} className="text-purple-600 dark:text-purple-400" />
            Recommended Technology Stack
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Click cards to toggle selection. Add custom frameworks, models, or databases anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            {totalSelected} selected
          </span>
          {isUpdating && (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse">
              <Sparkles size={12} /> Syncing diagrams…
            </span>
          )}
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const selectedCount = cat.items.filter((i) => i.selected).length;
          const isCollapsed = collapsedCategories[cat.id];

          return (
            <div
              key={cat.id}
              className="glass border border-border rounded-2xl p-4 transition-all hover:border-purple-500/30"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{cat.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {selectedCount} of {cat.items.length} active
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveInputCat(activeInputCat === cat.id ? null : cat.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs flex items-center gap-1 font-medium"
                    title="Add custom technology"
                  >
                    <Plus size={14} />
                    <span className="text-[10px] hidden sm:inline">Add</span>
                  </button>
                  <button
                    onClick={() => toggleCollapse(cat.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>
              </div>

              {/* Custom technology input form */}
              {activeInputCat === cat.id && (
                <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 animate-in">
                  <input
                    type="text"
                    placeholder={`Custom ${cat.name} component...`}
                    value={customInputs[cat.id] || ""}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubmit(cat.id);
                    }}
                    className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-2 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddSubmit(cat.id)}
                    className="btn-gradient text-xs px-2.5 py-1 rounded-lg text-white font-medium shrink-0"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Items List */}
              {!isCollapsed && (
                <div className="space-y-2">
                  {cat.items.map((item) => {
                    const isSelected = item.selected;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onToggle(cat.id, item.name)}
                        className={cn(
                          "group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 select-none",
                          isSelected
                            ? "bg-purple-500/10 border-purple-500/40 shadow-sm dark:shadow-[0_0_12px_rgba(139,92,246,0.12)]"
                            : "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-purple-400/40 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        {/* Checkbox Icon */}
                        <div
                          className={cn(
                            "w-4 h-4 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-400 text-white"
                              : "border-slate-400 dark:border-slate-600 group-hover:border-slate-500"
                          )}
                        >
                          {isSelected && <Check size={11} className="stroke-[3]" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm">{item.icon || "⚡"}</span>
                            <span
                              className={cn(
                                "text-xs font-bold truncate",
                                isSelected ? "text-purple-950 dark:text-white" : "text-slate-800 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-white"
                              )}
                            >
                              {item.name}
                            </span>

                            {/* Recommended badge */}
                            {item.recommended && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.2 rounded-full">
                                <Star size={8} className="fill-amber-500 text-amber-500" />
                                Recommended
                              </span>
                            )}

                            {/* Tag */}
                            {item.tag && (
                              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.2 rounded border border-slate-200 dark:border-white/5">
                                {item.tag}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
