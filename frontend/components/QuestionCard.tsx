"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, ChevronRight, Loader2 } from "lucide-react";
import type { Question, QuestionOption } from "@/lib/api";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (option: QuestionOption) => void;
  isLoading?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isLoading,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: QuestionOption) => {
    // Prevent double-clicks and clicks while parent is loading
    if (selected || isLoading) return;
    setSelected(option.value);
    onAnswer(option);
  };

  return (
    <div className="glass border border-border rounded-2xl p-6 sm:p-7 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
      </div>

      {/* Question text */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 leading-relaxed">
        {question.text}
      </h3>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option) => {
          const isSelected = selected === option.value;
          const isDisabled = !!selected || !!isLoading;

          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
              type="button"
              className={cn(
                // Base layout
                "group relative w-full text-left px-4 py-3.5 rounded-xl border",
                "flex items-center gap-3.5 transition-all duration-200",
                // Cursor
                isDisabled && !isSelected
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer",
                // Color states
                isSelected
                  ? "border-purple-500 bg-purple-500/15 dark:bg-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-purple-950 dark:text-white"
                  : option.recommended
                  ? "border-purple-500/30 dark:border-purple-500/30 bg-purple-500/[0.04] dark:bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 active:bg-purple-500/15"
                  : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-purple-400/40 hover:bg-slate-100/70 dark:hover:bg-white/[0.05]"
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-purple-600 dark:border-purple-400 bg-purple-600 dark:bg-purple-400"
                    : "border-slate-400 dark:border-slate-500 group-hover:border-purple-500"
                )}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-sm font-semibold block leading-snug",
                    isSelected
                      ? "text-purple-950 dark:text-white"
                      : "text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-white"
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>

              {/* Recommended badge */}
              {option.recommended && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full shrink-0">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  Recommended
                </span>
              )}

              {/* Right side: loading spinner when this option is selected, otherwise arrow */}
              {isSelected ? (
                <Loader2 size={16} className="text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
              ) : (
                !isDisabled && (
                  <ChevronRight
                    size={15}
                    className="text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Progress hint */}
      {selected && (
        <p className="mt-4 text-xs text-purple-600 dark:text-purple-400 text-center font-medium animate-pulse">
          {questionNumber === totalQuestions
            ? "Analyzing requirements and assembling optimal tech stack…"
            : "Processing response · Loading next question…"}
        </p>
      )}
    </div>
  );
}
