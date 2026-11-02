"use client";

import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";

interface Tile {
  id: string;
  label: string;
  description: string;
  note?: string;
  icon?: string;
  recommended?: boolean;
}

interface SelectTileGroupProps {
  title: string;
  tiles: Tile[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function SelectTileGroup({
  title,
  tiles,
  selected,
  onSelect,
}: SelectTileGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{title}</h3>
      <div className="grid gap-3">
        {tiles.map((tile) => {
          const isSelected = selected === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => onSelect(tile.id)}
              className={cn(
                "group w-full text-left p-4 rounded-xl border transition-all duration-200 relative",
                isSelected
                  ? "border-purple-500/60 bg-purple-500/10 shadow-glow"
                  : tile.recommended
                  ? "border-purple-500/20 bg-white/2 hover:border-purple-500/40 hover:bg-purple-500/5"
                  : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/5"
              )}
            >
              {/* Recommended ribbon */}
              {tile.recommended && (
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Star size={9} className="fill-amber-400" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                {tile.icon && (
                  <span className="text-2xl shrink-0 mt-0.5">{tile.icon}</span>
                )}

                <div className="flex-1 min-w-0 pr-16">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-white" : "text-slate-200"
                      )}
                    >
                      {tile.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {tile.description}
                  </p>
                  {tile.note && (
                    <p className="text-xs text-emerald-400/80 mt-1">
                      {tile.note}
                    </p>
                  )}
                </div>

                {/* Selected checkmark */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5",
                    isSelected
                      ? "border-purple-400 bg-purple-400"
                      : "border-slate-700"
                  )}
                >
                  {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
