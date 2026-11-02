"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Search,
  X,
  Check,
  Edit3,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/caredataApi";

export default function AIClassificationPage() {
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [analystNotes, setAnalystNotes] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sum, recs, tax] = await Promise.all([
        api.getClassificationSummary().catch(() => null),
        api.getClassificationRecords(statusFilter, search).catch(() => []),
        api.getClassificationTaxonomy().catch(() => []),
      ]);
      if (sum) setSummary(sum);
      setRecords(Array.isArray(recs) ? recs : []);
      setTaxonomy(Array.isArray(tax) ? tax : []);
    } catch (e) {
      console.error("AI Classification data load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenDetail = (rec: any) => {
    setSelectedRecord(rec);
    setSelectedCategory(rec.ai_suggested_category || "");
    setAnalystNotes("");
    setFeedback(null);
  };

  const handleApprove = async (providerId: string) => {
    try {
      await api.approveClassification(providerId);
      setFeedback("Category approved successfully.");
      await loadData();
      if (selectedRecord && selectedRecord.id === providerId) {
        setSelectedRecord({ ...selectedRecord, ai_status: "Approved" });
      }
    } catch (e) {
      alert("Failed to approve classification");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedRecord) return;
    try {
      await api.updateClassificationCategory(
        selectedRecord.id,
        selectedCategory,
        analystNotes || "Analyst updated category"
      );
      setFeedback("Category updated and marked as Corrected.");
      await loadData();
      setSelectedRecord({
        ...selectedRecord,
        ai_suggested_category: selectedCategory,
        ai_status: "Corrected",
      });
    } catch (e) {
      alert("Failed to update category");
    }
  };

  const handleRetryPending = async () => {
    setRetrying(true);
    try {
      const res = await api.retryPendingClassifications();
      setFeedback(`Retried ${res.updated_count} pending records.`);
      await loadData();
    } catch (e) {
      alert("Failed to retry pending classifications");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            AI Specialty Classification
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Classifies varied clinical descriptions into the agreed Australian General Practice Taxonomy.
          </p>
        </div>

        <button
          onClick={handleRetryPending}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-surface hover:bg-surface-muted text-foreground transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-600 dark:text-brand-400 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Retrying..." : "Retry Pending Items"}
        </button>
      </div>


      {/* ── 4 SUMMARY METRICS WITH LUXURY MATCHING COLOURS ────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 med-card med-card-blue group ${
            statusFilter === "all" ? "!ring-2 !ring-sky-500 !border-sky-500 shadow-md" : ""
          }`}
        >
          <span className="text-xs text-sky-800 dark:text-sky-300 block font-semibold">Total Processed</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">{summary?.classified ?? 150}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">All cohort records</span>
        </div>
        <div
          onClick={() => setStatusFilter("high_confidence")}
          className={`p-4 med-card med-card-emerald group ${
            statusFilter === "high_confidence" ? "!ring-2 !ring-emerald-500 !border-emerald-500 shadow-md" : ""
          }`}
        >
          <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-semibold">High Confidence</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block tracking-tight">{summary?.high_confidence ?? 142}</span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70 block mt-1 font-medium">≥ 88% confidence score</span>
        </div>
        <div
          onClick={() => setStatusFilter("needs_review")}
          className={`p-4 med-card med-card-amber group ${
            statusFilter === "needs_review" ? "!ring-2 !ring-amber-500 !border-amber-500 shadow-md" : ""
          }`}
        >
          <span className="text-xs text-amber-800 dark:text-amber-300 block font-semibold">Needs Review</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block tracking-tight">{summary?.needs_review ?? 8}</span>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/70 block mt-1 font-medium">Ambiguous or lower score</span>
        </div>
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 med-card med-card-purple group ${
            statusFilter === "pending" ? "!ring-2 !ring-purple-500 !border-purple-500 shadow-md" : ""
          }`}
        >
          <span className="text-xs text-purple-800 dark:text-purple-300 block font-semibold">Pending / Fallback</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1 block tracking-tight">{summary?.pending_failed ?? 0}</span>
          <span className="text-[10px] text-purple-700/80 dark:text-purple-400/70 block mt-1 font-medium">Fallback engine ready</span>
        </div>
      </div>

      {/* ── FILTER CHIPS & SEARCH ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Records" },
            { id: "high_confidence", label: "High Confidence" },
            { id: "needs_review", label: "Needs Review" },
            { id: "Approved", label: "Approved" },
            { id: "Corrected", label: "Corrected" },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setStatusFilter(flt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === flt.id
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800"
                  : "bg-surface text-foreground-muted border border-border hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-surface border border-border text-foreground placeholder-foreground-muted/60 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* ── CLASSIFICATION TABLE ──────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900/90 dark:via-surface dark:to-surface border border-slate-200 dark:border-slate-800 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-foreground-muted font-medium">
                <th className="py-2.5 px-3">Provider Name</th>
                <th className="py-2.5 px-3">Original Description</th>
                <th className="py-2.5 px-3">Suggested Taxonomy Category</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Clinical Reasoning</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length > 0 ? (
                records.map((rec) => {
                  const confPct = Math.round(rec.ai_confidence * 100);
                  const isApproved = rec.ai_status === "Approved";
                  return (
                    <tr key={rec.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {rec.accepted_doctor_name}
                      </td>
                      <td className="py-2.5 px-3 text-foreground-muted max-w-xs truncate font-mono text-[11px]">
                        "{rec.collected_specialty || "—"}"
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                        {rec.ai_suggested_category}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold ${
                              confPct >= 88
                                ? "text-brand-600 dark:text-brand-400"
                                : confPct >= 75
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-500"
                            }`}
                          >
                            {confPct}%
                          </span>
                          <div className="w-10 bg-surface-muted rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-1 rounded-full ${
                                confPct >= 88 ? "bg-brand-600" : "bg-amber-500"
                              }`}
                              style={{ width: `${confPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-foreground-muted max-w-xs truncate text-[11px]">
                        {rec.ai_explanation}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            rec.ai_status === "Approved"
                              ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border-brand-200 dark:border-brand-800"
                              : rec.ai_status === "Corrected"
                              ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border-brand-200 dark:border-brand-800"
                              : rec.ai_status === "Needs Review"
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-surface-muted text-foreground-muted border-border"
                          }`}
                        >
                          {rec.ai_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                        {!isApproved && (
                          <button
                            onClick={() => handleApprove(rec.id)}
                            className="px-2 py-0.5 text-xs font-medium rounded border border-brand-600/60 text-brand-700 dark:text-brand-300 hover:bg-brand-50 transition-colors"
                            title="Accept AI category"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDetail(rec)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-surface-muted text-foreground transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-foreground-muted">
                    No classification records matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAIL & TAXONOMY SELECTOR PANEL WITH BACKDROP ─────── */}
      {selectedRecord && (
        <>
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedRecord(null)}
          />

          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-slate-100"
            style={{ backgroundColor: "#0f172a" }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                    Taxonomy Review
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedRecord.accepted_doctor_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedback && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Original Text */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/90 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Original Specialty Description
                </span>
                <div className="font-mono text-xs text-white bg-slate-950 p-2.5 rounded border border-slate-800 mt-1">
                  "{selectedRecord.collected_specialty || "No description provided"}"
                </div>
              </div>

              {/* Model Confidence & Reasoning */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Groq Clinical Inference
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round(selectedRecord.ai_confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedRecord.ai_explanation}
                </p>
              </div>

              {/* Category Selector Dropdown */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Assigned Australian GP Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ backgroundColor: "#090d16", color: "#f8fafc" }}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-700 font-medium focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    {taxonomy.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Analyst Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    style={{ backgroundColor: "#090d16", color: "#f8fafc" }}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Enter reason for taxonomy change..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(selectedRecord.id)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-emerald-800 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                >
                  Approve Suggestion
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-subtle transition-all"
                >
                  Save & Update
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
