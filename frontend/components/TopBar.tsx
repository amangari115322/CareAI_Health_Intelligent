"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  RotateCcw,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { api, ActiveJob } from "../lib/caredataApi";
import { ProcessingTrackerModal } from "./ProcessingTrackerModal";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("caredata_theme") : null;
    if (saved === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setTheme("light");
    }

    const loadJob = async () => {
      try {
        const job = await api.getActiveJob();
        setActiveJob(job);
      } catch (err) {}
    };
    loadJob();
    const interval = setInterval(loadJob, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setTheme("light");
      localStorage.setItem("caredata_theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("caredata_theme", "dark");
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.resetDemoProject();
      window.location.reload();
    } catch (e) {
      alert("Failed to reset demo dataset");
    } finally {
      setResetting(false);
      setResetConfirmOpen(false);
    }
  };

  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  const getPageInfo = (path: string) => {
    switch (path) {
      case "/dashboard":
        return { title: "Executive Dashboard", subtitle: "Project overview, key metrics, and processing status" };
      case "/upload":
        return { title: "Upload Data", subtitle: "Import CSV/XLSX provider rosters, map columns, and execute pipeline" };
      case "/cleaning":
        return { title: "Data Cleaning & Validation", subtitle: "Review formatting issues, missing values, and duplicate candidates" };
      case "/classification":
        return { title: "AI Specialty Classification", subtitle: "Standardize provider clinical descriptions using Australian GP taxonomy" };
      case "/explorer":
        return { title: "Data Explorer", subtitle: "Search, filter, and inspect detailed practitioner dossiers" };
      case "/analytics":
        return { title: "Reports & Export", subtitle: "Export cleaned provider datasets, quality issues, and audit trails" };
      case "/collection":
        return { title: "Data Collection", subtitle: "Manage statutory registries and future public data connectors" };
      case "/settings":
        return { title: "Platform Settings", subtitle: "Configure validation rules, review thresholds, and taxonomy" };
      default:
        return { title: "Workspace", subtitle: "Sydney GP Research Pilot" };
    }
  };

  const pageInfo = getPageInfo(pathname);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-6 border-b border-border bg-surface/90 backdrop-blur-md">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
              {pageInfo.title}
            </h1>
            <span className="text-[11px] text-foreground-muted hidden sm:inline-block leading-none mt-1">
              {pageInfo.subtitle}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dataset & Pipeline Status Pill */}
          <button
            onClick={() => setTrackerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-border bg-surface hover:bg-surface-muted transition-colors text-foreground shadow-subtle"
            title="Click to view pipeline processing status"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs text-foreground">Pipeline Status</span>
            <span className="text-[11px] text-foreground-muted hidden sm:inline">
              (150 GPs Ready)
            </span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title="Reset dataset to default 150 Sydney GPs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Reset Demo</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-semibold">
              CD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium leading-none text-foreground">Analyst Session</span>
              <span className="text-[10px] text-foreground-muted leading-none mt-0.5">Sydney Research</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tracker Modal */}
      <ProcessingTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        job={activeJob}
      />

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-5 shadow-float text-foreground">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
              This will re-initialize the workspace with the clean pilot dataset of 150 Sydney General Practitioners, restoring all original values, detected duplicates, and standard cleaning issues.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors"
              >
                {resetting ? "Resetting..." : "Confirm & Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
