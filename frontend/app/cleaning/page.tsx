"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RotateCcw,
  Save,
  Lock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { api, CleaningIssue } from "../../lib/caredataApi";

export default function DataCleaningPage() {
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [issues, setIssues] = useState<CleaningIssue[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<CleaningIssue | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const tabs = [
    { key: "all", label: "All Issues" },
    { key: "missing", label: "Missing Fields" },
    { key: "invalid_format", label: "Invalid Formats" },
    { key: "duplicate_candidate", label: "Duplicates" },
    { key: "conflicting_value", label: "Conflicts" },
    { key: "needs_review", label: "Needs Review" },
  ];

  const loadData = async () => {
    try {
      const [sum, iss] = await Promise.all([
        api.getCleaningSummary().catch(() => null),
        api.getCleaningIssues(activeTab, search).catch(() => []),
      ]);
      if (sum) setSummary(sum);
      setIssues(Array.isArray(iss) ? iss : []);
    } catch (err) {
      console.error("Failed to load cleaning data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, search]);

  const handleOpenPanel = (issue: CleaningIssue) => {
    setSelectedIssue(issue);
    setEditValue(issue.suggested_value || issue.original_value || "");
    setEditReason(`Analyst verified field for ${issue.provider_name}`);
    setFeedbackMsg(null);
  };

  const handleSaveCorrection = async () => {
    if (!selectedIssue) return;
    setSaving(true);
    try {
      await api.saveIssueCorrection(selectedIssue.id, editValue, editReason);
      setFeedbackMsg("Correction saved. Original value preserved in evidence log.");
      await loadData();
      setSelectedIssue({ ...selectedIssue, status: "corrected", suggested_value: editValue });
      setTimeout(() => setSelectedIssue(null), 800);
    } catch (e) {
      alert("Failed to save correction");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!selectedIssue) return;
    try {
      await api.markIssueReviewed(selectedIssue.id);
      setFeedbackMsg("Marked as reviewed.");
      await loadData();
      setSelectedIssue({ ...selectedIssue, status: "reviewed" });
      setTimeout(() => setSelectedIssue(null), 600);
    } catch (e) {
      alert("Failed to mark reviewed");
    }
  };

  const handleResetIssue = async () => {
    if (!selectedIssue) return;
    try {
      await api.resetIssue(selectedIssue.id);
      setFeedbackMsg("Issue reset to original state.");
      await loadData();
      setSelectedIssue({ ...selectedIssue, status: "open" });
    } catch (e) {
      alert("Failed to reset issue");
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Data Cleaning & Validation
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Audit formatting, phone numbers, and duplicate candidates across 150 providers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted font-mono bg-surface px-2.5 py-1 rounded-md border border-border">
            Active Dataset: 150 Sydney GPs
          </span>
        </div>
      </div>

      {/* ── 5 CLEAN SUMMARY METRIC CARDS WITH LUXURY MATCHING COLOURS ─ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 med-card med-card-blue group">
          <span className="text-xs text-sky-800 dark:text-sky-300 block font-semibold">Total Records</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">{summary?.total_records ?? 150}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Full imported pilot cohort</span>
        </div>

        <div className="p-4 med-card med-card-emerald group">
          <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-semibold">Complete Records</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block tracking-tight">{summary?.complete_records ?? 138}</span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70 mt-1 block font-medium">92% audit compliance</span>
        </div>

        <div className="p-4 med-card med-card-amber group">
          <span className="text-xs text-amber-800 dark:text-amber-300 block font-semibold">Missing Fields</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block tracking-tight">{summary?.missing_information ?? 41}</span>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mt-1 block font-medium">Websites, faxes, suburbs</span>
        </div>

        <div className="p-4 med-card med-card-purple group">
          <span className="text-xs text-purple-800 dark:text-purple-300 block font-semibold">Invalid Formats</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1 block tracking-tight">{summary?.invalid_formats ?? 0}</span>
          <span className="text-[10px] text-purple-700/80 dark:text-purple-400/70 mt-1 block font-medium">Deterministic phone parsing</span>
        </div>

        <div className="p-4 med-card med-card-rose group">
          <span className="text-xs text-rose-800 dark:text-rose-300 block font-semibold">Action Queue</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block tracking-tight">{summary?.needs_review ?? 48}</span>
          <span className="text-[10px] text-rose-700/80 dark:text-rose-400/70 mt-1 block font-medium">Pending analyst sign-off</span>
        </div>
      </div>

      {/* ── TABS & SEARCH BAR ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === t.key
                    ? "bg-slate-800 text-white font-semibold border border-slate-700 shadow-subtle"
                    : "bg-surface text-foreground-muted border border-border hover:text-foreground hover:bg-surface-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues by provider or field..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface border border-border text-foreground placeholder-foreground-muted/60 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* ── CLEAN ISSUES TABLE ───────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900/90 dark:via-surface dark:to-surface border border-slate-200 dark:border-slate-800 shadow-luxury overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-foreground-muted font-semibold">
                  <th className="py-3 px-3.5">Provider</th>
                  <th className="py-3 px-3.5">Field</th>
                  <th className="py-3 px-3.5">Original Uploaded Value</th>
                  <th className="py-3 px-3.5">Issue Detected</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.length > 0 ? (
                  issues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-3.5 font-medium text-foreground whitespace-nowrap">
                        {iss.provider_name}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-foreground-muted whitespace-nowrap">
                        {iss.field_name}
                      </td>
                      <td className="py-3 px-3.5 text-foreground-muted max-w-xs truncate font-mono text-[11px]">
                        {iss.original_value || <span className="text-foreground-muted/40 italic">None (blank)</span>}
                      </td>
                      <td className="py-3 px-3.5 text-foreground max-w-sm truncate">
                        {iss.issue_description}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {iss.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenPanel(iss)}
                          className="px-3 py-1 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-foreground-muted">
                      No issues found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CORRECTION SLIDE-OVER DRAWER WITH BACKDROP OVERLAY ── */}
      {selectedIssue && (
        <>
          {/* Backdrop overlay prevents background table clickthrough & bleed */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
            onClick={() => setSelectedIssue(null)}
          />

          {/* Drawer Panel with 100% Solid Elevated Background */}
          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-semibold">
                    Quality Issue Review
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedIssue.provider_name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Field: <strong className="text-slate-800 dark:text-slate-200">{selectedIssue.field_name}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* Locked Original Uploaded Value */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  Original Uploaded Value (Locked for Audit)
                </span>
                <div className="font-mono text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 mt-1">
                  {selectedIssue.original_value || <span className="text-slate-400 italic">None (blank in upload)</span>}
                </div>
              </div>

              {/* Issue Description */}
              <div className="p-3.5 rounded-lg border border-amber-200 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-900/60 text-xs space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedIssue.issue_description}</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Recommended Action: {selectedIssue.suggested_action}
                </div>
              </div>

              {/* Editable Correction Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Accepted Standard Value
                  </label>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Enter verified value..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Analyst Justification / Verification Reason
                  </label>
                  <textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Explain reason for this change..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
              <button
                onClick={handleResetIssue}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                title="Reset to proposed default"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCorrection}
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-subtle transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Correction"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
