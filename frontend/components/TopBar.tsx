"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  RotateCcw,
  Search,
  Bell,
  Globe2,
  BookOpen,
  User,
  Activity,
  X,
} from "lucide-react";
import { api, ActiveJob } from "../lib/caredataApi";
import { ProcessingTrackerModal } from "./ProcessingTrackerModal";
import { PlatformGuideModal } from "./PlatformGuideModal";
import { GlobalJurisdictionDropdown } from "./GlobalJurisdictionDropdown";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<string>("Global");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("caredata_theme") : null;
    const initialTheme = saved === "light" ? "light" : "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorer?q=${encodeURIComponent(searchQuery.trim())}`);
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

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 md:px-8 border-b border-border bg-surface/95 backdrop-blur-md">
        {/* Left/Center: Search Bar matching Screenshot */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md mr-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, clinics or specialties..."
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-border bg-surface-muted/60 text-foreground placeholder:text-foreground-muted/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-foreground-muted hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Actions, Global Selector, Theme Switch, Notification, User Profile */}
        <div className="flex items-center gap-3">
          {/* Global Jurisdiction Selector (Custom High-Contrast Dropdown) */}
          <div className="hidden lg:block">
            <GlobalJurisdictionDropdown
              value={jurisdiction}
              onChange={setJurisdiction}
            />
          </div>

          {/* Guide & Downloads Button */}
          <button
            onClick={() => setGuideOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-surface-muted transition-colors shadow-sm"
            title="Open How it Works, How to Use It & What to Download"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Guide & Downloads</span>
          </button>

          {/* Pipeline Tracker Quick Pill */}
          <button
            onClick={() => setTrackerOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors text-foreground shadow-sm"
            title="View Pipeline Status"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">Pipeline</span>
          </button>

          {/* Theme Toggle Pill Switch matching screenshot */}
          <div
            onClick={toggleTheme}
            className="flex items-center p-1 rounded-full border border-border bg-surface-muted cursor-pointer hover:border-emerald-500/40 transition-all select-none"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                theme === "dark" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-foreground-muted"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                theme === "light" ? "bg-white text-amber-500 shadow-sm" : "text-foreground-muted"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => router.push("/cleaning")}
            className="relative p-2 rounded-xl border border-border text-foreground hover:bg-surface-muted transition-colors"
            title="Notifications & Review Alerts"
          >
            <Bell className="w-4 h-4 text-foreground-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-surface" />
          </button>

          {/* User Profile Pill matching screenshot */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm ring-2 ring-emerald-500/20">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">Demo User</span>
              <span className="text-[10px] text-foreground-muted leading-tight">Demo Account</span>
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

      {/* Platform Guide & Downloads Modal */}
      <PlatformGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-5 shadow-float text-foreground">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
              This will re-initialize the workspace with the verified practitioner cohort.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
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
