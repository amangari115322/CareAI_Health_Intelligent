"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
} from "lucide-react";
import { api, UploadPreviewResponse } from "../../lib/caredataApi";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"select" | "preview" | "mapping" | "confirm">("select");
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<UploadPreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSample(false);
      await loadPreview(file, false);
    }
  };

  const handleUseSample = async () => {
    setIsSample(true);
    await loadPreview(null, true);
  };

  const loadPreview = async (file: File | null, useSample: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("use_sample", String(useSample));

      const res = await api.previewUpload(formData);
      setPreviewData(res);
      setColumnMapping(res.suggested_mapping);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to load and preview file");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setIsSample(false);
    setPreviewData(null);
    setStep("select");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmAndProcess = async () => {
    if (!previewData) return;
    setProcessing(true);
    setError(null);
    try {
      await api.processUpload({
        file_name: previewData.file_name,
        column_mapping: columnMapping,
        use_sample: isSample,
        raw_data: previewData.preview_rows,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Pipeline processing encountered an error");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── STEPPER ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Data Ingestion Pipeline</h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Safely upload CSV or XLSX rosters, verify column meanings, and execute cleaning rules.
          </p>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className={`px-2 py-0.5 rounded ${step === "select" ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-semibold border border-brand-300" : "text-foreground-muted"}`}>
            1. Upload
          </span>
          <span className="text-foreground-muted">→</span>
          <span className={`px-2 py-0.5 rounded ${step === "preview" || step === "mapping" ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-semibold border border-brand-300" : "text-foreground-muted"}`}>
            2. Map
          </span>
          <span className="text-foreground-muted">→</span>
          <span className={`px-2 py-0.5 rounded ${step === "confirm" ? "bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-semibold border border-brand-300" : "text-foreground-muted"}`}>
            3. Execute
          </span>
        </div>
      </div>


      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── STEP 1: UPLOAD AREA ──────────────────────────────── */}
      {step === "select" && (
        <div className="space-y-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-400 dark:border-emerald-600/70 hover:border-emerald-500 rounded-2xl p-10 text-center bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 dark:from-[#0c2422] dark:via-[#0b1726] dark:to-[#09151c] transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Select or drag and drop your provider file
            </h3>
            <p className="text-xs text-foreground-muted max-w-xs mx-auto mt-1 leading-relaxed">
              Accepts <strong className="text-foreground font-semibold">CSV</strong> and{" "}
              <strong className="text-foreground font-semibold">XLSX</strong> rosters. The original raw file remains permanently preserved for audit.
            </p>
            <div className="mt-5">
              <span className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md inline-block transition-all group-hover:shadow-lg">
                Browse Files
              </span>
            </div>
          </div>

          {/* Quick Pilot Sample Ingestion Option with Luxury Blue Card */}
          <div className="p-4.5 med-card med-card-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                  <span>sydney_gp_list.xlsx (150 rows)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-sky-600 text-white">
                    Pre-Packaged Pilot
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                  150 Sydney GP records complete with duplicate candidate pairs, missing phone edge-cases, and varied specialty descriptions.
                </p>
              </div>
            </div>

            <button
              onClick={handleUseSample}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto hover:shadow-lg"
            >
              {loading ? "Loading..." : "Load Pilot Sample"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: PREVIEW FIRST 10-20 ROWS ─────────────────── */}
      {step === "preview" && previewData && (
        <div className="space-y-5">
          {/* File Meta */}
          <div className="p-3.5 rounded-lg bg-surface border border-border flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <div>
                <span className="text-xs font-semibold text-foreground mr-2">{previewData.file_name}</span>
                <span className="text-[11px] text-foreground-muted">
                  ({previewData.file_format} • {previewData.row_count} rows • {(previewData.file_size_bytes / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-brand-700 dark:text-brand-300 font-medium">
                <CheckCircle2 className="w-3 h-3 text-brand-600 dark:text-brand-400" /> Valid Spreadsheet Format
              </span>
              <button
                onClick={handleRemoveFile}
                className="px-2 py-0.5 text-xs text-foreground-muted hover:text-foreground rounded border border-border"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle">
            <div className="px-4 py-2.5 border-b border-border bg-surface-muted text-xs flex justify-between items-center">
              <span className="font-semibold text-foreground">
                Row Preview (First {previewData.preview_rows.length} Records)
              </span>
              <span className="text-[11px] text-foreground-muted font-mono">
                Preserving original values
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface text-foreground-muted font-medium sticky top-0">
                    <th className="py-2 px-3 text-left w-10 font-mono text-[11px]">#</th>
                    {previewData.headers.map((h) => (
                      <th key={h} className="py-2 px-3 text-left whitespace-nowrap font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  {previewData.preview_rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-2 px-3 text-foreground-muted">{idx + 1}</td>
                      {previewData.headers.map((h) => (
                        <td key={h} className="py-2 px-3 text-foreground whitespace-nowrap">
                          {row[h] || <span className="text-foreground-muted/50 italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              onClick={() => setStep("select")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:bg-surface-muted transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => setStep("mapping")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors"
            >
              Continue to Mapping <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: COLUMN MAPPING ───────────────────────────── */}
      {step === "mapping" && previewData && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Map Incoming Columns to Standard Schema</h3>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Confirm how each spreadsheet column should be interpreted. You can set unneeded columns to "Ignore".
                </p>
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-mono font-medium">
                {Object.values(columnMapping).filter((v) => v !== "Ignore").length} of {previewData.headers.length} mapped
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {previewData.headers.map((header) => {
                const currentTarget = columnMapping[header] || "Ignore";
                return (
                  <div
                    key={header}
                    className="p-3 rounded-lg bg-surface-muted/60 border border-border flex items-center justify-between gap-3"
                  >
                    <div className="truncate flex-1">
                      <div className="text-xs font-medium text-foreground truncate">{header}</div>
                      <div className="text-[11px] text-foreground-muted truncate font-mono">
                        Sample: {String(previewData.preview_rows[0]?.[header] || "—")}
                      </div>
                    </div>

                    <div className="w-44 flex-shrink-0">
                      <select
                        value={currentTarget}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [header]: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md bg-surface border border-border text-foreground focus:outline-none focus:border-brand-500"
                      >
                        {previewData.supported_targets.map((tgt) => (
                          <option key={tgt} value={tgt}>
                            {tgt === "Ignore" ? "— Ignore column —" : `→ ${tgt}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              onClick={() => setStep("preview")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:bg-surface-muted transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Preview
            </button>
            <button
              onClick={() => setStep("confirm")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors"
            >
              Review & Execute <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: MANDATORY CONFIRMATION ───────────────────── */}
      {step === "confirm" && previewData && (
        <div className="p-6 rounded-xl bg-surface border border-border shadow-float max-w-xl mx-auto space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Confirm & Execute Ingestion Pipeline</h3>
              <p className="text-xs text-foreground-muted">
                Confirmation is required before importing or altering project data.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-muted border border-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Source File:</span>
              <span className="font-semibold text-foreground">{previewData.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Record Count:</span>
              <span className="font-mono font-semibold text-foreground">{previewData.row_count} rows</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Target Project:</span>
              <span className="font-semibold text-foreground">Sydney GP Research Pilot</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Origin Attribution:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">User Uploaded (Verified)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              onClick={() => setStep("mapping")}
              disabled={processing}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:bg-surface-muted transition-colors"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleConfirmAndProcess}
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-all shadow-subtle flex items-center gap-2"
            >
              {processing ? "Processing Pipeline..." : "Confirm & Process"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
