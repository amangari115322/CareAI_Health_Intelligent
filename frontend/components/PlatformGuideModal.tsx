"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Activity,
  Layers,
  Database,
  Globe2,
  ExternalLink,
} from "lucide-react";
import { api } from "../lib/caredataApi";

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "how-it-works" | "how-to-use" | "downloads";
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "how-it-works",
}) => {
  const [activeTab, setActiveTab] = useState<"how-it-works" | "how-to-use" | "downloads">(defaultTab);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (reportType: string, filename: string) => {
    setDownloading(reportType);
    try {
      await api.downloadReport(reportType, filename);
    } catch (e) {
      alert("Export failed: " + (e as any).message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                CareData AI — Enterprise Platform Guide
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold">
                  Global Architecture
                </span>
              </h2>
              <p className="text-xs text-foreground-muted">
                Executive operational manual: how it works, how to use it, and what every export file is for.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-6 bg-surface">
          <button
            onClick={() => setActiveTab("how-it-works")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "how-it-works"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. How CareData AI Works</span>
          </button>
          <button
            onClick={() => setActiveTab("how-to-use")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "how-to-use"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. How to Use the Platform</span>
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "downloads"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>3. What to Download & For What</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: HOW IT WORKS */}
          {activeTab === "how-it-works" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                <h4 className="font-bold text-foreground flex items-center gap-2 text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  The Clinical Data Intelligence Lifecycle
                </h4>
                <p className="text-foreground-muted leading-relaxed">
                  CareData AI does not simply run basic string trims. It executes an end-to-end clinical data refinery
                  specifically engineered for international healthcare directories, hospitals, health insurers, and Primary Health Networks (PHNs).
                </p>
              </div>

              {/* 5 Stages */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">STAGE 01</span>
                  <h5 className="font-bold text-xs text-foreground">Multi-Format Ingestion</h5>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Parses CSV, Excel (.xlsx), hospital roster dumps, and clinic registers without schema lock-in.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">STAGE 02</span>
                  <h5 className="font-bold text-xs text-foreground">Deterministic Cleansing</h5>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Standardizes international phone numbers (E.164, Landline/Mobile), capitalizes doctor honorifics, and validates geographic suburbs.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">STAGE 03</span>
                  <h5 className="font-bold text-xs text-foreground">AI Specialty Taxonomy</h5>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Groq LLM harmonizes unstructured clinical biographies into statutory registries (RACGP, CMS NPI, NMC India).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">STAGE 04</span>
                  <h5 className="font-bold text-xs text-foreground">Fuzzy Deduplication</h5>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Detects same practitioner working across multiple clinics via token similarity & phone clustering.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">STAGE 05</span>
                  <h5 className="font-bold text-xs text-foreground">Audit Provenance</h5>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Raw uploaded values are permanently locked. Every analyst approval is timestamped for compliance.
                  </p>
                </div>
              </div>

              {/* Multi-Jurisdiction Support */}
              <div className="p-4 rounded-xl border border-border bg-surface-muted/60 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-sky-500" />
                  Global Regulatory Jurisdiction Standards Supported
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="font-bold block text-foreground">🇦🇺 Australia</span>
                    <span className="text-[10px] text-foreground-muted">AHPRA / RACGP / Medicare</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="font-bold block text-foreground">🇺🇸 United States</span>
                    <span className="text-[10px] text-foreground-muted">CMS NPI (10-Digit) / AMA</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="font-bold block text-foreground">🇮🇳 India</span>
                    <span className="text-[10px] text-foreground-muted">NMC / ABDM HPR Registry</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="font-bold block text-foreground">🇳🇵 Nepal & Global</span>
                    <span className="text-[10px] text-foreground-muted">NMC Nepal / WHO ICD-11</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO USE THE PLATFORM */}
          {activeTab === "how-to-use" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-muted border border-border">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Upload Your Provider Roster</h4>
                  <p className="text-foreground-muted mt-1 leading-relaxed">
                    Navigate to <strong>Upload Data</strong>. Drop your CSV or Excel workbook containing doctor records.
                    The system automatically maps columns (Doctor Name, Specialty, Clinic, Address, Phone, Website) and runs pre-flight validation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-muted border border-border">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Audit Data Cleaning Issues</h4>
                  <p className="text-foreground-muted mt-1 leading-relaxed">
                    Open <strong>Data Cleaning</strong>. Review flagged items (unformatted phone numbers, missing websites, inconsistent casing).
                    Click any item to inspect original vs. suggested values. You can approve in 1 click or manually override with a logged reason.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-muted border border-border">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Review AI Specialty Classifications</h4>
                  <p className="text-foreground-muted mt-1 leading-relaxed">
                    Open <strong>AI Classification</strong>. The Groq model maps informal descriptions (e.g. "skin checks & dermatoscope")
                    to the official RACGP/CMS category (Skin Cancer Medicine). High-confidence items (&gt;88%) are auto-marked; review pending ones with confidence ratings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-muted border border-border">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Resolve Duplicate Doctor Candidates</h4>
                  <p className="text-foreground-muted mt-1 leading-relaxed">
                    Filter by <strong>Duplicates</strong>. Inspect pairs like "Dr. Anthony Taylor" vs "Dr. A. Taylor" at the same clinic.
                    Mark as Distinct Practitioners or Merge as Alias while preserving source audit trails.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-muted border border-border">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Export Research-Ready Verified Datasets</h4>
                  <p className="text-foreground-muted mt-1 leading-relaxed">
                    Open <strong>Reports & Export</strong>. Download clean Excel files with summary KPI sheets, complete audit logs, or FHIR-compatible JSON.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT TO DOWNLOAD & FOR WHAT */}
          {activeTab === "downloads" && (
            <div className="space-y-4">
              <p className="text-xs text-foreground-muted">
                CareData AI generates 5 production-grade export artifacts. Each file serves a dedicated enterprise healthcare function:
              </p>

              <div className="space-y-3">
                {/* 1. Cleaned Provider Dataset */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-bold text-foreground text-sm">1. Cleaned Healthcare Provider Roster</h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        .xlsx / .csv
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[11px] leading-relaxed">
                      <strong>Purpose:</strong> Production dataset for EHR ingestion (Epic, Cerner), patient directories, and telehealth booking platforms.
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Contains: Standardized doctor names, E.164 phone numbers, verified practice addresses, and official taxonomy mappings.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload("cleaned", "cleaned_provider_dataset.xlsx")}
                    disabled={downloading === "cleaned"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading === "cleaned" ? "Exporting..." : "Download Excel"}</span>
                  </button>
                </div>

                {/* 2. Quality & Audit Log */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <h4 className="font-bold text-foreground text-sm">2. Data Quality & Audit Trail Log</h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold">
                        .csv
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[11px] leading-relaxed">
                      <strong>Purpose:</strong> Regulatory compliance, insurance credentialing audits, and data governance verification.
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Contains: Every original raw field value, suggested fix, analyst sign-off timestamp, and override rationale.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload("quality", "data_quality_issues.csv")}
                    disabled={downloading === "quality"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading === "quality" ? "Exporting..." : "Download CSV"}</span>
                  </button>
                </div>

                {/* 3. Duplicate Candidates */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-bold text-foreground text-sm">3. Duplicate & Entity Resolution Report</h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                        .csv
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[11px] leading-relaxed">
                      <strong>Purpose:</strong> Revenue cycle management, provider network optimization, and eliminating phantom doctor listings.
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Contains: Similarity confidence ratings, shared clinic phone numbers, address overlaps, and resolution status.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload("duplicates", "duplicate_candidates.csv")}
                    disabled={downloading === "duplicates"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading === "duplicates" ? "Exporting..." : "Download CSV"}</span>
                  </button>
                </div>

                {/* 4. AI Specialty Matrix */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-bold text-foreground text-sm">4. AI Specialty Taxonomy Matrix</h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold">
                        .xlsx
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[11px] leading-relaxed">
                      <strong>Purpose:</strong> Clinical workforce planning, regional referral routing, and medical recruitment strategy.
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Contains: Unstructured clinical descriptions mapped to official RACGP/CMS categories with confidence percentages.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload("specialties", "ai_specialty_classifications.xlsx")}
                    disabled={downloading === "specialties"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading === "specialties" ? "Exporting..." : "Download Excel"}</span>
                  </button>
                </div>

                {/* 5. Provenance & Evidence */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <h4 className="font-bold text-foreground text-sm">5. Source Evidence & Registry Verification Trail</h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold">
                        .csv
                      </span>
                    </div>
                    <p className="text-foreground-muted text-[11px] leading-relaxed">
                      <strong>Purpose:</strong> Legal verification, hospital credentialing committees, and statutory registry cross-referencing.
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Contains: Ingestion timestamps, raw source URLs, AHPRA/NPI registry references, and cryptographic verification status.
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload("evidence", "source_evidence.csv")}
                    disabled={downloading === "evidence"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading === "evidence" ? "Exporting..." : "Download CSV"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-muted/40 flex items-center justify-between text-xs">
          <span className="text-foreground-muted text-[11px]">
            CareData AI Enterprise v1.0 • Global Multi-Jurisdiction Healthcare Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
