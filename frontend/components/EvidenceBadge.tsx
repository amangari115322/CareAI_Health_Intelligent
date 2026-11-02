import React from "react";
import { CheckCircle2, ShieldCheck, Database } from "lucide-react";

interface EvidenceBadgeProps {
  status: "Collected" | "Accepted" | "Verified" | string;
  source?: string;
  date?: string;
  showDetails?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  source = "User Uploaded",
  date,
  showDetails = false,
}) => {
  let badgeStyle = "bg-surface-muted text-foreground-muted border-border";
  let icon = <Database className="w-3 h-3 mr-1 text-foreground-subtle" />;

  if (status === "Verified") {
    badgeStyle = "bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/60";
    icon = <ShieldCheck className="w-3 h-3 mr-1 text-brand-600 dark:text-brand-400" />;
  } else if (status === "Accepted") {
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50";
    icon = <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />;
  }

  return (
    <div className="inline-flex items-center gap-1.5" title={`Source: ${source}${date ? ` • Collected: ${date}` : ""}`}>
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeStyle}`}
      >
        {icon}
        {status}
      </span>
      {showDetails && (
        <span className="text-[11px] text-foreground-subtle truncate max-w-[120px]">
          via {source}
        </span>
      )}
    </div>
  );
};
