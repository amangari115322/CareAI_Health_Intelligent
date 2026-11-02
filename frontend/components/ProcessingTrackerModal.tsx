import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, Clock, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ActiveJob } from "../lib/caredataApi";

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ActiveJob | null;
}

export const ProcessingTrackerModal: React.FC<TrackerModalProps> = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  const stages = [
    { name: "Data Cleaning", key: "cleaning", countInfo: "Standardized doctor honorifics, Australian phone & address format" },
    {
      name: "Duplicate Detection",
      key: "duplicates",
      countInfo: job.counts?.duplicates_found !== undefined ? `${job.counts.duplicates_found} potential duplicate pairs flagged` : "Checking clinic phone & name similarity",
    },
    {
      name: "AI Classification",
      key: "ai",
      countInfo: job.counts?.classified_count !== undefined ? `${job.counts.classified_count} of ${job.row_count} classified into RACGP taxonomy` : "Running Groq clinical model",
    },
    {
      name: "Data Validation",
      key: "validation",
      countInfo: `${job.counts?.clean_records ?? 0} clean records, ${job.counts?.issues_count ?? 0} validation flags`,
    },
    { name: "Save Results", key: "save", countInfo: "Persisted structured records, provenance history, and audit log" },
  ];

  const getStageStatus = (index: number) => {
    if (job.status === "Completed") return "completed";
    if (job.status === "Failed" && index === (job.stage_index ?? 1) - 1) return "failed";
    if (index < (job.stage_index ?? 1) - 1) return "completed";
    if (index === (job.stage_index ?? 1) - 1) return "running";
    return "pending";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-2xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100"
        style={{ backgroundColor: "#0f172a" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Active Dataset
              </span>
              <span className="text-sm font-semibold text-white">{job.file_name}</span>
              <span className="text-xs text-slate-400">({job.row_count} records)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Started {job.start_time ? new Date(job.start_time).toLocaleTimeString() : "Just now"} • Pipeline Status: <strong className="text-emerald-400">{job.status}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tracker Stages Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            {stages.map((st, idx) => {
              const status = getStageStatus(idx);
              return (
                <div
                  key={st.name}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    status === "running"
                      ? "bg-brand-50/60 border-brand-500/40 dark:bg-brand-950/30 dark:border-brand-700/50 shadow-subtle"
                      : status === "completed"
                      ? "bg-surface-muted/40 border-border"
                      : "bg-surface-muted/10 border-border-subtle opacity-70"
                  }`}
                >
                  <div className="mt-0.5">
                    {status === "completed" && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                    {status === "running" && <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin" />}
                    {status === "pending" && <Clock className="w-4 h-4 text-foreground-subtle" />}
                    {status === "failed" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Stage {idx + 1}: {st.name}
                      </span>
                      <span className="text-[11px] font-mono capitalize text-foreground-muted">
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted mt-0.5">{st.countInfo}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warnings Section */}
          {job.warnings && job.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Data Quality Warnings ({job.warnings.length})
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-amber-800 dark:text-amber-300/90 list-disc list-inside">
                {job.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-foreground-muted font-medium">Pipeline Completion</span>
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{Math.round(job.progress)}%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/40">
          <div className="text-xs text-foreground-muted">
            Status: <span className="font-semibold text-foreground">{job.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-muted transition-colors"
            >
              Close
            </button>
            <Link
              href="/cleaning"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors"
            >
              Review Issues <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
