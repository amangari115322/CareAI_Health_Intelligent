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
  Globe2,
} from "lucide-react";
import { CareDataLogo } from "../../components/CareDataLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@caredata.ai");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [rememberMe, setRememberMe] = useState(true);

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Theme Switcher at Top-Right */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border bg-surface/80 hover:bg-surface text-foreground-muted hover:text-foreground backdrop-blur-md shadow-sm transition-all"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          type="button"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden z-10">
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
                Enter your research workspace for global healthcare provider directories & verification.
              </p>
            </div>

            {/* Quick Demo Access Action Card */}
            <div className="my-5 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Instant Demo Workspace</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  Multi-jurisdiction records pre-loaded (Australia, USA, India, Nepal, Russia). Zero setup needed.
                </p>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoEntry}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95"
              >
                <span>Instant Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Input */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Analyst Account
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground-muted">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                    <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-mono rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                    className="w-3.5 h-3.5 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <span className="text-[11px]">Remember analyst session</span>
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified Local Auth
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2 group active:scale-95"
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
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </Link>
            <span className="text-[10px] font-mono text-foreground-muted">v1.0.0 • SQLite Offline</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: CLINICAL HOSPITAL BACKDROP & LIVE COHORT ── */}
        <div className="hidden md:block md:col-span-5 relative overflow-hidden bg-slate-900 border-l border-border">
          {/* Hospital Image */}
          <img
            src="/images/hospital-modern.jpg"
            alt="Modern Clinical Hospital"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

          {/* Frosted Glass Overlay Card */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
            {/* Top pill */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Global Cohort
              </span>
              <Globe2 className="w-4 h-4 text-emerald-300" />
            </div>

            {/* Center Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Global Provider Directory Intelligence
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Enterprise healthcare directory intelligence with Groq AI specialty categorization, deduplication, and deterministic phone normalization.
                </p>
              </div>

              {/* High-Integrity Stats Card */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Total Practitioners:</span>
                  <span className="font-mono font-bold text-white">150 Records</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Jurisdictions:</span>
                  <span className="font-semibold text-emerald-300">Australia, USA, India, Nepal, Russia</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Data Completeness:</span>
                  <span className="font-mono font-bold text-emerald-400">97.4% Health Score</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Taxonomy Standards:</span>
                  <span className="font-medium text-slate-200">RACGP, CMS NPI, NMC, WHO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Data Boundaries:</span>
                  <span className="font-mono text-emerald-300 text-[11px] font-semibold">Zero PHI / Directory Only</span>
                </div>
              </div>
            </div>

            {/* Bottom compliance note */}
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-2.5 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>International Data Privacy & Provenance Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
