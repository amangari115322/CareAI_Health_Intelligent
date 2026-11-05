"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, Clock, X, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { ActiveJob } from "../lib/caredataApi";

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: ActiveJob | null;
}

export const defaultPipelineJob: ActiveJob = {
  id: "JOB-ACTIVE-882",
  file_name: "healthcare_data.csv",
  row_count: 1490,
  current_stage: "AI Classification",
  stage_index: 3,
  status: "In Progress",
  progress: 74,
  counts: {
    total_records: 1490,
    classified_count: 1102,
    duplicates_found: 48,
    issues_count: 86,
    clean_records: 1356,
  },
  warnings: [
    "48 duplicate candidate pairs flagged for entity resolution review",
    "12 provider records require manual phone validation",
    "8 clinical notes matched to primary care with moderate AI confidence",
  ],
  start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
};

export const ProcessingTrackerModal: React.FC<TrackerModalProps> = ({ isOpen, onClose, job }) => {
  if (!isOpen) return null;

  const currentJob = job || defaultPipelineJob;

  const stages = [
    {
      name: "Data Cleaning & Standardization",
      key: "cleaning",
      countInfo: "Standardized titles, Australian E.164 phone numbers & full clinic street addresses",
    },
    {
      name: "Duplicate Candidate Detection",
      key: "duplicates",
      countInfo:
        currentJob.counts?.duplicates_found !== undefined
          ? `${currentJob.counts.duplicates_found} potential duplicate pairs flagged for analyst review`
          : "Fuzzy matching doctor names, practice affiliations & shared telephone points",
    },
    {
      name: "AI Specialty Classification",
      key: "ai",
      countInfo:
        currentJob.counts?.classified_count !== undefined
          ? `${currentJob.counts.classified_count.toLocaleString()} of ${currentJob.row_count.toLocaleString()} records categorized with Groq LLM`
          : "Running Groq clinical model against agreed RACGP taxonomy",
    },
    {
      name: "Validation & Human Review Queue",
      key: "validation",
      countInfo: `${currentJob.counts?.clean_records ?? 1356} verified clean records, ${currentJob.counts?.issues_count ?? 86} action flags`,
    },
    {
      name: "Directory Provenance & Audit Persistence",
      key: "save",
      countInfo: "Persisted structured records, provenance history, and audit log to SQLite",
    },
  ];

  const getStageStatus = (index: number) => {
    if (currentJob.status === "Completed") return "completed";
    if (currentJob.status === "Failed" && index === (currentJob.stage_index ?? 3) - 1) return "failed";
    if (index < (currentJob.stage_index ?? 3) - 1) return "completed";
    if (index === (currentJob.stage_index ?? 3) - 1) return "running";
    return "pending";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-border rounded-2xl shadow-2xl overflow-hidden bg-surface text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Engine Pipeline
              </span>
              <span className="text-sm font-bold text-foreground">{currentJob.file_name}</span>
              <span className="text-xs text-foreground-muted font-mono">
                ({currentJob.row_count.toLocaleString()} records)
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1 flex items-center gap-2">
              <span>
                Stage {currentJob.stage_index ?? 3} of 5:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {currentJob.current_stage || "AI Classification"}
                </strong>
              </span>
              <span>•</span>
              <span>
                Status:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {currentJob.status}
                </strong>
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title="Close tracker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tracker Stages Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Progress Bar */}
          <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Pipeline Engine Completion
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(currentJob.progress)}%
              </span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden border border-border">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
          </div>

          {/* Stepper List */}
          <div className="space-y-2.5">
            {stages.map((st, idx) => {
              const status = getStageStatus(idx);
              return (
                <div
                  key={st.name}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    status === "running"
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                      : status === "completed"
                      ? "bg-surface-muted/40 border-border"
                      : "bg-surface-muted/10 border-border/50 opacity-60"
                  }`}
                >
                  <div className="mt-0.5">
                    {status === "completed" && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {status === "running" && (
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-surface">
                        <Loader2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      </div>
                    )}
                    {status === "pending" && (
                      <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center bg-surface">
                        <Clock className="w-3 h-3 text-foreground-muted" />
                      </div>
                    )}
                    {status === "failed" && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        Stage {idx + 1}: {st.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          status === "running"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : status === "completed"
                            ? "bg-surface text-foreground-muted border border-border"
                            : "text-foreground-muted"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                      {st.countInfo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warnings Section */}
          {currentJob.warnings && currentJob.warnings.length > 0 && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Data Quality & Anomaly Flags ({currentJob.warnings.length})
              </div>
              <ul className="space-y-1 text-amber-800 dark:text-amber-300/90 list-disc list-inside">
                {currentJob.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/40">
          <div className="text-xs text-foreground-muted">
            Engine: <span className="font-semibold text-foreground">Groq LLM + SQLite In-Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-muted text-foreground transition-colors shadow-sm"
            >
              Dismiss
            </button>
            <Link
              href="/cleaning"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
            >
              <span>Review Issues Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
