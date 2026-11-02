"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Users,
  Database,
  CheckCircle2,
  Copy,
  Sparkles,
  AlertCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  ArrowDownToLine,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { api, DashboardStats, DashboardCharts, ActivityItem, ActiveJob } from "../../lib/caredataApi";
import { ProcessingTrackerModal } from "../../components/ProcessingTrackerModal";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, chartsData, activitiesData, jobData] = await Promise.all([
          api.getStats().catch(() => null),
          api.getCharts().catch(() => null),
          api.getActivities().catch(() => []),
          api.getActiveJob().catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (chartsData) setCharts(chartsData);
        if (activitiesData) setActivities(activitiesData);
        if (jobData) setActiveJob(jobData);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── TOP HERO HEADER BANNER WITH EXECUTIVE MEDICAL DEPTH ─ */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white shadow-md">
        {/* Background photo with subtle dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/clinical-team.jpg"
            alt="Clinical Care Team"
            className="w-full h-full object-cover object-right opacity-20 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Greater Sydney Primary Care Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Executive Provider Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standardize messy provider rosters, classify clinical specialties into RACGP taxonomy, detect duplicate doctor listings, and export research-ready datasets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-white transition-all shadow-subtle"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Roster</span>
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 text-white transition-all shadow-subtle backdrop-blur-sm"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>Export Excel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4-STEP PIPELINE STRIP WITH REFINED MICRO-INTERACTIONS ─ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Step 1: Upload */}
        <Link
          href="/upload"
          className="p-4 med-card med-card-step flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-200 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              1
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors block">
                Upload Roster
              </span>
              <span className="text-[11px] text-foreground-muted">150 GPs Ingested</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1.5 transition-all" />
        </Link>

        {/* Step 2: Clean & Standardize */}
        <Link
          href="/cleaning"
          className="p-4 med-card med-card-step flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              2
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block">
                Clean & Standardize
              </span>
              <span className="text-[11px] text-foreground-muted">48 Action Items</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1.5 transition-all" />
        </Link>

        {/* Step 3: AI Taxonomy */}
        <Link
          href="/classification"
          className="p-4 med-card med-card-step flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              3
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors block">
                AI Taxonomy
              </span>
              <span className="text-[11px] text-foreground-muted">150 Mapped (Groq)</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1.5 transition-all" />
        </Link>

        {/* Step 4: Export Reports */}
        <Link
          href="/analytics"
          className="p-4 med-card med-card-step flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              4
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block">
                Export Reports
              </span>
              <span className="text-[11px] text-foreground-muted">5 Reports Ready</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1.5 transition-all" />
        </Link>
      </div>

      {/* ── ACTIVE PIPELINE STATUS STRIP ─────────────────────── */}
      {activeJob && (
        <div
          onClick={() => setTrackerOpen(true)}
          className="p-4 med-card med-card-pipeline flex flex-col md:flex-row md:items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Pipeline Execution</span>
                <span className="text-xs text-foreground-muted font-mono">{activeJob.file_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-semibold">
                  {activeJob.status}
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Current Stage: <strong className="text-foreground">{activeJob.current_stage}</strong> ({activeJob.row_count} records processed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-36 hidden sm:block">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-foreground-muted font-medium">Progress</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{Math.round(activeJob.progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-foreground-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
              View Tracker <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* ── 6 CORE METRIC CARDS WITH LUXURY MATCHING FIELD COLOURS ──── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Records (BLUE) */}
        <div
          onClick={() => router.push("/explorer")}
          className="p-4 med-card med-card-blue flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">Total Records</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
            {stats?.total_records ?? 150}
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-sky-200/60 dark:border-sky-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pilot cohort</span>
            <span className="text-sky-600 dark:text-sky-400 group-hover:text-sky-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 2: Unique Doctors (TEAL) */}
        <div
          onClick={() => router.push("/explorer")}
          className="p-4 med-card med-card-teal flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">Unique Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
            {stats?.unique_providers ?? 150}
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Distinct GPs</span>
            <span className="text-teal-600 dark:text-teal-400 group-hover:text-teal-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              View <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 3: Completeness (EMERALD) */}
        <div
          onClick={() => router.push("/cleaning")}
          className="p-4 med-card med-card-emerald flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Completeness</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {stats?.data_completeness ?? 96.4}%
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Health score</span>
            <span className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              Audit <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 4: Potential Duplicates (AMBER) */}
        <div
          onClick={() => router.push("/cleaning?tab=duplicate_candidate")}
          className="p-4 med-card med-card-amber flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Duplicates</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {stats?.potential_duplicates ?? 5}
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Flagged pairs</span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:text-amber-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              Resolve <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 5: AI Classified (PURPLE) */}
        <div
          onClick={() => router.push("/classification")}
          className="p-4 med-card med-card-purple flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">AI Classified</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 tracking-tight">
            {stats?.ai_classified ?? 150}
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">RACGP mapped</span>
            <span className="text-purple-600 dark:text-purple-400 group-hover:text-purple-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              View <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 6: Review Queue (ROSE) */}
        <div
          onClick={() => router.push("/cleaning?tab=needs_review")}
          className="p-4 med-card med-card-rose flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Review Queue</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            {stats?.needs_review ?? 48}
          </div>
          <div className="text-[11px] mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Action items</span>
            <span className="text-rose-600 dark:text-rose-400 group-hover:text-rose-500 font-semibold text-[10px] flex items-center gap-0.5 transition-colors">
              Resolve <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* ── CHARTS SECTION: SPECIALTY MIX & QUALITY BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Specialty Distribution */}
        <div className="p-5 med-card med-card-step !cursor-default">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Specialty Taxonomy Mix
              </h3>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Primary care sub-specialty breakdown across Greater Sydney (RACGP Taxonomy)
              </p>
            </div>
            <Link
              href="/classification"
              className="text-xs text-foreground-muted hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-0.5 transition-colors group"
            >
              Taxonomy Table <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {(charts?.specialty_distribution || []).slice(0, 6).map((item) => {
              const total = stats?.total_records || 150;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div
                  key={item.name}
                  onClick={() => router.push(`/explorer?specialty=${encodeURIComponent(item.name)}`)}
                  className="p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/60 cursor-pointer group transition-all"
                >
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate max-w-[280px]">
                      {item.name}
                    </span>
                    <span className="font-mono text-foreground-muted text-[11px]">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all group-hover:from-teal-400 group-hover:to-emerald-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cohort Quality Breakdown & Provenance */}
        <div className="p-5 med-card med-card-step !cursor-default flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cohort Quality & Validation Status
                </h3>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  Categorized by phone validity, address accuracy, and doctor casing
                </p>
              </div>
              <Link
                href="/cleaning"
                className="text-xs text-foreground-muted hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-0.5 transition-colors group"
              >
                Cleaning Queue <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5">
              {(charts?.quality_overview || []).map((q) => {
                const isClean = q.name === "Clean";
                const total = stats?.total_records || 150;
                const pct = Math.round((q.value / total) * 100);
                return (
                  <div
                    key={q.name}
                    onClick={() => router.push(`/explorer?quality=${encodeURIComponent(q.name)}`)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isClean
                        ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30 hover:border-emerald-500 hover:shadow-md hover:-translate-y-1"
                        : "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 hover:border-amber-500 hover:shadow-md hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{q.name}</span>
                      <span
                        className={`text-2xl font-bold font-mono ${
                          isClean ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {q.value}
                      </span>
                    </div>
                    <div className="text-[11px] text-foreground-muted font-mono mt-1.5">
                      {pct}% of cohort ({isClean ? "Verified Ready" : "Requires Review"})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Attribution Strip */}
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Source Attribution & Provenance</span>
              </span>
              <span className="text-foreground-muted font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-border">
                Zero Invented URLs
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {(charts?.source_distribution || []).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[11px] text-foreground-muted">
                  <span>{s.name}</span>
                  <span className="font-mono text-foreground font-semibold">{s.value} records</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT OPERATIONAL ACTIVITY LOG ──────────────────── */}
      <div className="p-5 med-card med-card-step !cursor-default">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Operational Activity & Audit Trail
            </h3>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Chronological log of file ingestions, analyst edits, and export jobs
            </p>
          </div>
          <span className="text-[10px] font-mono font-medium text-foreground-muted px-2 py-0.5 rounded bg-surface-muted border border-border">
            Immutable Audit Trail
          </span>
        </div>

        <div className="mt-3 divide-y divide-border">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-surface-muted flex items-center justify-center text-emerald-500 mt-0.5 flex-shrink-0 border border-border">
                    {act.action_type === "import" && <UploadCloud className="w-3.5 h-3.5" />}
                    {act.action_type === "correction" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {act.action_type === "export" && <FileCheck className="w-3.5 h-3.5" />}
                    {!["import", "correction", "export"].includes(act.action_type) && <Activity className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">{act.title}</div>
                    <div className="text-[11px] text-foreground-muted">{act.description}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-foreground-muted whitespace-nowrap">
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString() : "Recent"}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-foreground-muted">
              No recent operational actions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* 5-Stage Tracker Modal */}
      <ProcessingTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        job={activeJob}
      />
    </div>
  );
}
