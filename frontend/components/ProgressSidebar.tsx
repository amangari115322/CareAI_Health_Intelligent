"use client";

import { cn } from "@/lib/utils";
import {
  Lightbulb,
  HelpCircle,
  Layers,
  Network,
  FileCheck2,
  Cpu,
  Download,
  Check,
  RotateCcw,
} from "lucide-react";
import { useProjectStore, type BuildStep } from "@/lib/store";

interface StepConfig {
  id: BuildStep;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: "idea", label: "Project Idea", sublabel: "Describe concept", icon: <Lightbulb size={15} /> },
  { id: "requirements", label: "Requirements", sublabel: "Guided questions", icon: <HelpCircle size={15} /> },
  { id: "tech_selection", label: "Tech Stack", sublabel: "Select components", icon: <Layers size={15} /> },
  { id: "architecture", label: "Architecture", sublabel: "Visual diagram", icon: <Network size={15} /> },
  { id: "blueprint_review", label: "Blueprint", sublabel: "Verify specification", icon: <FileCheck2 size={15} /> },
  { id: "generating", label: "Generation", sublabel: "Writing code", icon: <Cpu size={15} /> },
  { id: "ready", label: "Ready & ZIP", sublabel: "Download project", icon: <Download size={15} /> },
];

const STEP_ORDER: BuildStep[] = [
  "idea",
  "requirements",
  "tech_selection",
  "architecture",
  "blueprint_review",
  "generating",
  "ready",
];

interface ProgressSidebarProps {
  currentStep: BuildStep;
}

export default function ProgressSidebar({ currentStep }: ProgressSidebarProps) {
  const store = useProjectStore();
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  const isStepAvailable = (stepId: BuildStep, idx: number) => {
    if (idx <= currentIdx) return true;
    if (stepId === "requirements" && store.questions.length > 0) return true;
    if (stepId === "tech_selection" && store.categories.length > 0) return true;
    if (stepId === "architecture" && store.diagrams) return true;
    if (stepId === "blueprint_review" && store.blueprintSpec) return true;
    if (stepId === "ready" && (store.setupSteps.length > 0 || store.blueprintSpec)) return true;
    return false;
  };

  const handleStepClick = (stepId: BuildStep, idx: number) => {
    if (isStepAvailable(stepId, idx)) {
      store.setStep(stepId);
    }
  };

  return (
    <aside className="w-60 shrink-0 hidden lg:flex flex-col justify-between py-5 px-3.5 border-r border-border backdrop-blur-xl transition-colors duration-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-surface/60 dark:bg-surface/30">
      <div className="space-y-3.5">
        <div className="px-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Builder Pipeline
          </p>
          <span className="text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            Step {Math.min(currentIdx + 1, 7)} of 7
          </span>
        </div>

        <div className="space-y-1">
          {STEPS.map((step, idx) => {
            const available = isStepAvailable(step.id, idx);
            const isDone = (idx < currentIdx && available) || (idx !== currentIdx && available);
            const isActive = idx === currentIdx;
            const isPending = !available;
            const isClickable = available;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id, idx)}
                disabled={!isClickable}
                type="button"
                className={cn(
                  "w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 group relative",
                  isActive && "bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(139,92,246,0.12)]",
                  isClickable && !isActive && "hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer",
                  isPending && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Step indicator circle */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold transition-all",
                    isActive && "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.35)]",
                    isDone && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
                    isPending && "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5"
                  )}
                >
                  {isDone ? <Check size={13} className="stroke-[2.5]" /> : step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold truncate leading-snug",
                      isActive
                        ? "text-purple-950 dark:text-white"
                        : isDone
                        ? "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5">
                    {step.sublabel}
                  </p>
                </div>

                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start New Project reset button */}
      {store.projectId && (
        <div className="pt-3 border-t border-border px-1">
          <button
            onClick={() => {
              if (window.confirm("Start a new project? Current project progress will be reset.")) {
                store.reset();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-colors"
          >
            <RotateCcw size={12} />
            Start New Project
          </button>
        </div>
      )}
    </aside>
  );
}
