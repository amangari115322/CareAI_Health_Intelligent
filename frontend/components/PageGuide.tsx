import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from "lucide-react";

interface PageGuideProps {
  title: string;
  description: string;
  steps?: { title: string; desc: string }[];
  defaultOpen?: boolean;
}

export const PageGuide: React.FC<PageGuideProps> = ({
  title,
  description,
  steps,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-r from-brand-50/50 via-surface to-brand-50/20 dark:from-brand-950/20 dark:via-surface dark:to-brand-950/10 p-3.5 transition-all text-xs">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-foreground flex items-center gap-2">
              {title}
              <span className="text-[10px] font-normal text-foreground-muted bg-surface-muted px-2 py-0.5 rounded-full border border-border">
                User Guide
              </span>
            </span>
            <p className="text-[11px] text-foreground-muted mt-0.5">{description}</p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded text-foreground-muted hover:text-foreground transition-colors ml-2"
          aria-label={isOpen ? "Collapse guide" : "Expand guide"}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && steps && steps.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-brand-100 dark:border-brand-900/40 grid grid-cols-1 md:grid-cols-3 gap-2.5 animate-fade-in-up">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-surface/80 border border-border flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 font-semibold text-foreground text-[11px] mb-1">
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-mono">
                  {i + 1}
                </span>
                {st.title}
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
