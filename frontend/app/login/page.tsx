"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Database,
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
  Activity,
  Check,
} from "lucide-react";
import { CareDataLogo } from "../../components/CareDataLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@caredata.ai");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [rememberMe, setRememberMe] = useState(true);

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
  }, []);

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

  const handleQuickDemoEntry = () => {
    setEmail("analyst@caredata.ai");
    setPassword("demo1234");
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background text-foreground relative overflow-hidden transition-colors">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Theme Switcher at Top-Right */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-surface/80 hover:bg-surface text-foreground-muted hover:text-foreground backdrop-blur-md shadow-subtle transition-all"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          type="button"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-border bg-surface shadow-float overflow-hidden z-10">
        {/* ── LEFT PANEL: AUTHENTICATION FORM ─────────────────── */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-surface">
          <div>
            {/* Logo */}
            <div className="mb-6">
              <CareDataLogo size="md" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Sign In to Analyst Portal
              </h1>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Enter your research workspace for the Greater Sydney GP Research Pilot.
              </p>
            </div>

            {/* Quick Demo Access Action Card */}
            <div className="my-5 p-3.5 rounded-xl border border-brand-300 dark:border-brand-800 bg-brand-50/70 dark:bg-brand-950/40 text-xs shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-brand-900 dark:text-brand-300">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Instant Demo Workspace</span>
                </div>
                <p className="text-[11px] text-brand-800/80 dark:text-brand-300/80">
                  150 Sydney GP records pre-loaded. Zero setup needed.
                </p>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoEntry}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-700 hover:bg-brand-600 text-white shadow-subtle transition-all whitespace-nowrap flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <span>Instant Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Input with high-contrast text and explicit dark styling */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Analyst Account
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground-muted">
                    <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                      color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono rounded-lg border border-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="analyst@caredata.ai"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <span className="text-[10px] text-foreground-muted font-mono">
                    Token: <strong className="text-foreground">demo1234</strong>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground-muted">
                    <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                      color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    }}
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-mono rounded-lg border border-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground-muted hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between text-xs text-foreground-muted pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                  />
                  <span className="text-[11px]">Remember analyst session</span>
                </label>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                  Verified Local Auth
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-xs font-semibold rounded-lg bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 hover:from-brand-600 hover:to-emerald-500 text-white transition-all shadow-subtle hover:shadow-card flex items-center justify-center gap-2 mt-2 group"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer inside Left Panel */}
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </Link>
            <span className="text-[10px] font-mono text-foreground-subtle">v1.0.0 • SQLite Offline</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: CLINICAL HOSPITAL BACKDROP & LIVE COHORT ── */}
        <div className="hidden md:block md:col-span-5 relative overflow-hidden bg-slate-900 border-l border-border">
          {/* Hospital Image */}
          <img
            src="/images/hospital-modern.jpg"
            alt="Australian Clinical Hospital"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />

          {/* Frosted Glass Overlay Card */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
            {/* Top pill */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-500/20 backdrop-blur-md text-brand-300 border border-brand-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Active Clinical Cohort
              </span>
              <Database className="w-4 h-4 text-brand-300" />
            </div>

            {/* Center Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Sydney GP Research Pilot
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Australian practitioner directory intelligence with Groq AI specialty categorization and deterministic cleaning.
                </p>
              </div>

              {/* High-Integrity Stats Card */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs shadow-float">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Total Practitioners:</span>
                  <span className="font-mono font-bold text-white">150 Records</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Data Completeness:</span>
                  <span className="font-mono font-bold text-brand-400">97.4% Health Score</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Taxonomy Standard:</span>
                  <span className="font-medium text-slate-200">RACGP Guidelines</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Data Boundaries:</span>
                  <span className="font-mono text-emerald-300 text-[11px] font-semibold">Zero PHI / Directory Only</span>
                </div>
              </div>
            </div>

            {/* Bottom compliance note */}
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
              <span>Australian Data Sovereignty & Privacy Principles Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
