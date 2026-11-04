"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  Search,
  Sun,
  Moon,
  UploadCloud,
  FileSpreadsheet,
  Check,
  HelpCircle,
  FileCheck,
  Building2,
  Stethoscope,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Globe2,
  BookOpen,
  Download,
  AlertCircle,
} from "lucide-react";
import { CareDataLogo } from "../components/CareDataLogo";
import { PlatformGuideModal } from "../components/PlatformGuideModal";
import { GlobalJurisdictionDropdown } from "../components/GlobalJurisdictionDropdown";
import { api } from "../lib/caredataApi";

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"raw" | "cleaned">("cleaned");
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("Global");
  const [guideSubTab, setGuideSubTab] = useState<"how-it-works" | "how-to-use" | "downloads">("how-it-works");
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand-500/20">
      {/* ── TOP NAVIGATION ───────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <CareDataLogo size="md" />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-foreground-muted">
            <button
              onClick={() => scrollToSection("overview")}
              className="hover:text-foreground transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection("interactive-demo")}
              className="hover:text-foreground transition-colors"
            >
              Interactive Cleaning
            </button>
            <button
              onClick={() => scrollToSection("capabilities")}
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection("pipeline")}
              className="hover:text-foreground transition-colors"
            >
              5-Stage Pipeline
            </button>
            <button
              onClick={() => scrollToSection("how-it-works-and-downloads")}
              className="hover:text-brand-600 dark:hover:text-brand-400 font-bold transition-colors text-foreground flex items-center gap-1"
            >
              <span>User Guide & Downloads</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Theme & CTA Button */}
          <div className="flex items-center gap-3">
            {/* Global Jurisdiction Selector (Custom High-Contrast Dropdown) */}
            <div className="hidden lg:block">
              <GlobalJurisdictionDropdown
                value={selectedJurisdiction}
                onChange={setSelectedJurisdiction}
              />
            </div>

            {/* Quick Guide Trigger */}
            <button
              onClick={() => setGuideModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-surface-muted transition-colors"
              title="Open Complete Operational Guide & Download Specs"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Guide & Downloads</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-700 hover:bg-brand-600 text-white transition-all shadow-subtle hover:shadow-card"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION WITH DOCTOR PHOTOGRAPHY BACKDROP ─────── */}
      <section id="overview" className="relative pt-12 pb-20 px-6 overflow-hidden border-b border-border">
        {/* Subtle Background Glows & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 right-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-300 dark:border-brand-800 bg-brand-50/80 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Australian Healthcare Provider Intelligence • 150 Sydney GPs Pilot Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Turn unstructured provider rosters into{" "}
              <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
                verified clinical datasets.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed max-w-2xl">
              CareData AI is an enterprise data intelligence platform purpose-built for healthcare researchers and network analysts. Ingest messy provider spreadsheets, automatically standardize Australian telephone formats and doctor honorifics, classify specialties using AI, resolve duplicates, and export research-ready Excel files.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Australian Phone Normalization (02 & 04)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>AI Clinical Specialty Taxonomy (RACGP)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Audit Trail: Original Raw Values Never Lost</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Formatted Excel (.xlsx) & CSV Exports</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-lg bg-brand-700 hover:bg-brand-600 text-white shadow-card transition-all"
              >
                <span>Open Analyst Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollToSection("interactive-demo")}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground transition-colors"
              >
                <span>See Data Transformation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual with Real Doctor Image & Clinical Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-float group">
              {/* Doctor Hero Image */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-900">
                <img
                  src="/images/doctor-hero.jpg"
                  alt="Australian Medical Practitioner"
                  className="w-full h-full object-cover object-top filter brightness-[0.95] contrast-[1.02] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>

              {/* Overlay Glass Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-card text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <span className="font-semibold text-foreground">Verified Sydney Cohort</span>
                  </div>
                  <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                    150 GPs Ingested
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-surface-muted border border-border">
                    <span className="text-[10px] text-foreground-muted block">Data Health</span>
                    <strong className="text-foreground font-mono text-xs">97.4%</strong>
                  </div>
                  <div className="p-2 rounded bg-surface-muted border border-border">
                    <span className="text-[10px] text-foreground-muted block">AI Accuracy</span>
                    <strong className="text-foreground font-mono text-xs">94.8%</strong>
                  </div>
                  <div className="p-2 rounded bg-surface-muted border border-border">
                    <span className="text-[10px] text-foreground-muted block">Format Errors</span>
                    <strong className="text-brand-600 dark:text-brand-400 font-mono text-xs">0 Unresolved</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO: BEFORE VS AFTER TRANSFORMATION ─── */}
      <section id="interactive-demo" className="py-16 px-6 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Data Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            See Exactly What CareData AI Fixes
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-2 leading-relaxed">
            Real healthcare provider rosters arrive in inconsistent formats with missing prefixes, invalid phone numbers, and unstructured clinical notes. Here is how CareData AI transforms them.
          </p>

          {/* Toggle Button */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-surface-muted border border-border">
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "raw"
                  ? "bg-surface text-foreground shadow-subtle border border-border"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              1. Raw Messy Input Spreadsheet
            </button>
            <button
              onClick={() => setActiveTab("cleaned")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "cleaned"
                  ? "bg-brand-700 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Cleaned & Classified Output</span>
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface-muted/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {activeTab === "raw" ? "Raw Input Roster (Uncleaned)" : "CareData AI Standardized Record (Ready for Analysis)"}
              </span>
              <span className="text-foreground-muted font-mono text-[11px]">
                {activeTab === "raw" ? "• Inconsistent Casing & Unformatted Telephones" : "• RACGP Categorized & Audited"}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              activeTab === "raw"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                : "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-300"
            }`}>
              {activeTab === "raw" ? "Needs Pipeline Review" : "Validated & Clean"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-foreground-muted bg-surface text-left">
                  <th className="py-3 px-4 font-semibold">Doctor Name</th>
                  <th className="py-3 px-4 font-semibold">Specialty</th>
                  <th className="py-3 px-4 font-semibold">Practice Facility</th>
                  <th className="py-3 px-4 font-semibold">Clinic Phone</th>
                  <th className="py-3 px-4 font-semibold">Suburb / State</th>
                  <th className="py-3 px-4 font-semibold">Quality Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeTab === "raw" ? (
                  <>
                    <tr className="bg-amber-50/20 dark:bg-amber-950/10">
                      <td className="py-3.5 px-4 font-mono text-amber-800 dark:text-amber-300">dr. liam campbell</td>
                      <td className="py-3.5 px-4 text-foreground-muted">family doctor, kids, elderly</td>
                      <td className="py-3.5 px-4 text-foreground-muted">SURRY HILLS MED CTR</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400">0293191234</td>
                      <td className="py-3.5 px-4 text-foreground-muted">surry hills nsw</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Bad Format
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-amber-50/20 dark:bg-amber-950/10">
                      <td className="py-3.5 px-4 font-mono text-amber-800 dark:text-amber-300">SARAH CHEN (MD)</td>
                      <td className="py-3.5 px-4 text-foreground-muted">Antenatal care & womens health gp</td>
                      <td className="py-3.5 px-4 text-foreground-muted">bondi health collective</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400">91305522</td>
                      <td className="py-3.5 px-4 text-foreground-muted">Bondi</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Missing Area Code
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-amber-50/20 dark:bg-amber-950/10">
                      <td className="py-3.5 px-4 font-mono text-amber-800 dark:text-amber-300">Marcus Vance</td>
                      <td className="py-3.5 px-4 text-foreground-muted">skin checks, dermatoscope specialist</td>
                      <td className="py-3.5 px-4 text-foreground-muted">Chatswood Healthcare</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400">+61 2 9411 8899</td>
                      <td className="py-3.5 px-4 text-foreground-muted">Chatswood NSW 2067</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Missing Title
                        </span>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="bg-brand-50/20 dark:bg-brand-950/10">
                      <td className="py-3.5 px-4 font-medium text-foreground">Dr. Liam Campbell</td>
                      <td className="py-3.5 px-4 font-medium text-brand-600 dark:text-brand-400">
                        General Practice / Family Medicine
                        <span className="block text-[10px] text-foreground-muted font-mono font-normal">AI Match: 98% Confidence</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">Surry Hills Medical Centre</td>
                      <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">(02) 9319 1234</td>
                      <td className="py-3.5 px-4 text-foreground">Surry Hills, NSW</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200">
                          Clean ✓
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-brand-50/20 dark:bg-brand-950/10">
                      <td className="py-3.5 px-4 font-medium text-foreground">Dr. Sarah Chen</td>
                      <td className="py-3.5 px-4 font-medium text-brand-600 dark:text-brand-400">
                        Women's Health & Antenatal Care
                        <span className="block text-[10px] text-foreground-muted font-mono font-normal">AI Match: 96% Confidence</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">Bondi Health Collective</td>
                      <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">(02) 9130 5522</td>
                      <td className="py-3.5 px-4 text-foreground">Bondi, NSW</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200">
                          Clean ✓
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-brand-50/20 dark:bg-brand-950/10">
                      <td className="py-3.5 px-4 font-medium text-foreground">Dr. Marcus Vance</td>
                      <td className="py-3.5 px-4 font-medium text-brand-600 dark:text-brand-400">
                        Skin Cancer Medicine
                        <span className="block text-[10px] text-foreground-muted font-mono font-normal">AI Match: 95% Confidence</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">Chatswood Healthcare Centre</td>
                      <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">(02) 9411 8899</td>
                      <td className="py-3.5 px-4 text-foreground">Chatswood, NSW</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200">
                          Clean ✓
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 3 CORE CAPABILITY CARDS WITH CLINICAL PHOTOS ─────── */}
      <section id="capabilities" className="py-16 px-6 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Enterprise Healthcare Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-2">
            Engineered specifically to solve the data challenges of Australian primary healthcare networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Data Cleaning & Phone Normalization */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
            <div className="h-44 w-full relative overflow-hidden bg-slate-900">
              <img
                src="/images/clinical-team.jpg"
                alt="Clinical Team Review"
                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                Rule Engine
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Deterministic Data Cleaning</h3>
                <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                  Converts irregular Australian phone entries into standard landline `(02) XXXX XXXX` and mobile `04XX XXX XXX` numbers. Capitalizes doctor titles (`Dr.`, `A/Prof`, `Prof.`) and fixes Sydney suburbs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-600 dark:text-brand-400">Zero Overwrites</span>
                <span className="text-[11px] text-foreground-muted">Preserves Raw Uploads</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Specialty Classification */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
            <div className="h-44 w-full relative overflow-hidden bg-slate-900">
              <img
                src="/images/doctor-research.jpg"
                alt="AI Healthcare Research"
                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                Groq AI Powered
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Specialty Classification</h3>
                <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                  Maps heterogeneous clinical descriptions to the official Australian General Practice Taxonomy using Groq high-speed AI. Every prediction includes a 0–100% confidence rating and clinical rationale.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-600 dark:text-brand-400">RACGP Taxonomy</span>
                <span className="text-[11px] text-foreground-muted">Offline Rule Fallback</span>
              </div>
            </div>
          </div>

          {/* Card 3: Duplicate Resolution & Excel Export */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
            <div className="h-44 w-full relative overflow-hidden bg-slate-900">
              <img
                src="/images/hospital-modern.jpg"
                alt="Modern Hospital Architecture"
                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-[10px] font-bold text-foreground border border-border">
                Excel & Audit
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Duplicate Detection & Export</h3>
                <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                  Identifies duplicate doctor listings practicing across multiple clinics using token similarity and clinic phone matching. Exports formatted Excel workbooks with zebra styling and summary tabs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-600 dark:text-brand-400">Openpyxl XLSX + CSV</span>
                <span className="text-[11px] text-foreground-muted">5 Formatted Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5-STAGE PIPELINE EXPLAINER ───────────────────────── */}
      <section id="pipeline" className="py-16 px-6 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Complete Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            The 5-Stage Processing Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-2">
            Every uploaded roster moves through 5 transparent stages with live progress tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-mono font-bold text-xs mb-3">
                01
              </span>
              <h4 className="text-xs font-bold text-foreground">Data Cleaning</h4>
              <p className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                Applies Australian phone regex, strips corrupted characters, and formats doctor titles.
              </p>
            </div>
            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 mt-3 pt-2 border-t border-border">
              Standardization
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-mono font-bold text-xs mb-3">
                02
              </span>
              <h4 className="text-xs font-bold text-foreground">Duplicate Detection</h4>
              <p className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                Calculates pairwise name token similarity and flags identical practice contact points.
              </p>
            </div>
            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 mt-3 pt-2 border-t border-border">
              Similarity Engine
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-mono font-bold text-xs mb-3">
                03
              </span>
              <h4 className="text-xs font-bold text-foreground">AI Classification</h4>
              <p className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                Groq LLM harmonizes raw provider bio notes into RACGP approved specialty categories.
              </p>
            </div>
            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 mt-3 pt-2 border-t border-border">
              Groq Clinical Model
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-mono font-bold text-xs mb-3">
                04
              </span>
              <h4 className="text-xs font-bold text-foreground">Quality Validation</h4>
              <p className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                Scores record completeness and queues invalid or missing fields for analyst approval.
              </p>
            </div>
            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 mt-3 pt-2 border-t border-border">
              Health Scoring
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-mono font-bold text-xs mb-3">
                05
              </span>
              <h4 className="text-xs font-bold text-foreground">Save & Audit</h4>
              <p className="text-[11px] text-foreground-muted mt-1.5 leading-relaxed">
                Commits validated records, creates immutable audit trails, and unlocks report exports.
              </p>
            </div>
            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 mt-3 pt-2 border-t border-border">
              SQLite & Provenance
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION: HOW IT WORKS, HOW TO USE IT & WHAT TO DOWNLOAD ────── */}
      <section id="how-it-works-and-downloads" className="py-20 px-6 max-w-7xl mx-auto border-b border-border">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete Operational Manual</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How It Works, How to Use It & What to Download
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-2 leading-relaxed">
            CareData AI is an enterprise healthcare provider intelligence engine. Here is a clear, transparent breakdown
            of the underlying architecture, the operational workflow for healthcare analysts, and the business purpose of every exportable file.
          </p>

          {/* Sub-tab Switcher */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-surface-muted border border-border">
            <button
              onClick={() => setGuideSubTab("how-it-works")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                guideSubTab === "how-it-works"
                  ? "bg-surface text-foreground shadow-subtle border border-border"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>1. How It Works</span>
            </button>
            <button
              onClick={() => setGuideSubTab("how-to-use")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                guideSubTab === "how-to-use"
                  ? "bg-surface text-foreground shadow-subtle border border-border"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. How to Use It</span>
            </button>
            <button
              onClick={() => setGuideSubTab("downloads")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                guideSubTab === "downloads"
                  ? "bg-brand-700 text-white shadow-subtle"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>3. What to Download & For What</span>
            </button>
          </div>
        </div>

        {/* Tab 1: How It Works */}
        {guideSubTab === "how-it-works" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">1. Multi-Source Ingestion</h3>
                  <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                    Healthcare provider rosters arrive in inconsistent spreadsheets, hospital extracts, or clinic databases.
                    CareData AI ingests messy CSVs or Excel workbooks, dynamically maps column names, and preserves raw records in immutable storage.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-[11px] text-foreground-muted font-mono">
                  <span>Input Formats:</span>
                  <span className="font-semibold text-foreground">.XLSX, .CSV, Tabular EHR</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">2. Deterministic Cleaning</h3>
                  <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                    Standardizes phone numbers into E.164 and callable formats (+61 Australia, +1 USA, +91 India, +977 Nepal).
                    Parses doctor titles (Dr., A/Prof, Prof.), separates messy multi-line street addresses, and corrects geographic suburbs.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-[11px] text-foreground-muted font-mono">
                  <span>Phone Standards:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">E.164 Strict Regex</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">3. AI Taxonomy & Entity Graph</h3>
                  <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                    High-speed Groq LLM harmonizes ambiguous clinical descriptions into statutory specialties (RACGP, CMS NPI, NMC).
                    Fuzzy token similarity algorithms detect when the same doctor is listed multiple times across different regional clinics.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-[11px] text-foreground-muted font-mono">
                  <span>Taxonomy Matching:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Groq LLM + Rules</span>
                </div>
              </div>
            </div>

            {/* Global Regulatory Standards Strip */}
            <div className="p-5 rounded-2xl bg-surface-muted border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Globe2 className="w-6 h-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Multi-Jurisdiction Healthcare Directory Support</h4>
                  <p className="text-[11px] text-foreground-muted">
                    Engineered to support national healthcare directory structures and identifier formats worldwide.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border font-mono text-[10px] text-foreground">
                  🇦🇺 AHPRA / RACGP
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border font-mono text-[10px] text-foreground">
                  🇺🇸 CMS NPI (10-Digit)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border font-mono text-[10px] text-foreground">
                  🇮🇳 NMC / ABDM HPR
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border font-mono text-[10px] text-foreground">
                  🇳🇵 Nepal NMC / MoHP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to Use It */}
        {guideSubTab === "how-to-use" && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300 text-xs">
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <h4 className="font-bold text-foreground text-sm">Upload Provider Rosters or Select Demo Cohort</h4>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Go to <strong>Upload Data</strong>. You can upload an XLSX/CSV file or work with the pre-seeded pilot cohort (150 Sydney GPs).
                  The pre-flight mapper confirms all required clinical fields before processing.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <h4 className="font-bold text-foreground text-sm">Standardize & Clean Formatting Discrepancies</h4>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Go to <strong>Data Cleaning</strong>. The dashboard automatically flags telephone formatting issues, casing irregularities,
                  and missing websites. You can approve individual suggestions or batch-accept all deterministic corrections.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <h4 className="font-bold text-foreground text-sm">Verify AI Clinical Taxonomy Classifications</h4>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Go to <strong>AI Classification</strong>. Inspect how messy provider bio descriptions were mapped to official categories.
                  High-confidence matches (&gt;88%) are highlighted in emerald; you can adjust classifications with 1 click.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <h4 className="font-bold text-foreground text-sm">Inspect Practitioner Dossiers & Resolve Duplicates</h4>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Open <strong>Data Explorer</strong> to search doctors by name, clinic, or specialty.
                  Click any doctor row to view their complete dossier drawer: original vs accepted values, clinic affiliations, and audit trail.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                5
              </span>
              <div>
                <h4 className="font-bold text-foreground text-sm">Export Formatted Reports for Enterprise Systems</h4>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Visit <strong>Reports & Export</strong> to download formatted Excel workbooks or CSV files for clinical EHRs,
                  regulatory compliance packages, or credentialing audits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: What to Download & For What Purpose */}
        {guideSubTab === "downloads" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
              <span className="font-bold text-foreground block">
                Official Export Catalog: 5 Specialized Enterprise Deliverables
              </span>
              <p className="text-foreground-muted mt-1 leading-relaxed">
                CareData AI does not produce raw generic data dumps. It compiles 5 purpose-built, audit-ready deliverables
                tailored to hospital administrators, compliance officers, and analytics engineers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* File 1 */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      FILE 01 • SPREADSHEET (.XLSX)
                    </span>
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Cleaned Healthcare Provider Roster</h4>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Business Purpose:</strong> Production roster ingestion into Hospital EHRs (Epic, Cerner), patient-facing search directories, and telehealth booking systems.
                  </p>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Contents:</strong> Fully standardized doctor names, E.164 phone numbers, valid physical addresses, and verified RACGP/CMS specialty categories.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("cleaned", "cleaned_provider_dataset.xlsx")}
                  disabled={downloading === "cleaned"}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === "cleaned" ? "Compiling..." : "Download Cleaned Roster (Excel)"}</span>
                </button>
              </div>

              {/* File 2 */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      FILE 02 • AUDIT TRAIL (.CSV)
                    </span>
                    <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Data Quality & Compliance Audit Log</h4>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Business Purpose:</strong> Legal compliance, health insurance credentialing audits, and Primary Health Network (PHN) data governance verification.
                  </p>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Contents:</strong> Complete record of every raw uploaded value, the exact transformation rule applied, analyst sign-off timestamp, and override rationale.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("quality", "data_quality_issues.csv")}
                  disabled={downloading === "quality"}
                  className="mt-4 w-full py-2 px-3 rounded-xl border border-border bg-surface-muted hover:bg-surface text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === "quality" ? "Compiling..." : "Download Audit Log (CSV)"}</span>
                </button>
              </div>

              {/* File 3 */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      FILE 03 • ENTITY REPORT (.CSV)
                    </span>
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Duplicate Candidate & Entity Resolution Queue</h4>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Business Purpose:</strong> Revenue cycle management, provider directory deduplication, and eliminating phantom doctor billing.
                  </p>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Contents:</strong> Pairwise fuzzy similarity scores, shared clinic contact points, address overlaps, and operational resolution states.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("duplicates", "duplicate_candidates.csv")}
                  disabled={downloading === "duplicates"}
                  className="mt-4 w-full py-2 px-3 rounded-xl border border-border bg-surface-muted hover:bg-surface text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === "duplicates" ? "Compiling..." : "Download Duplicates Report (CSV)"}</span>
                </button>
              </div>

              {/* File 4 */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      FILE 04 • TAXONOMY MATRIX (.XLSX)
                    </span>
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">AI Specialty Taxonomy Breakdown Matrix</h4>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Business Purpose:</strong> Clinical workforce capacity planning, regional specialty referral balancing, and health authority resource allocation.
                  </p>
                  <p className="text-foreground-muted text-[11px] mt-2 leading-relaxed">
                    <strong>Contents:</strong> Doctor clinical biographies harmonized into official primary care categories with AI confidence ratings and rationale notes.
                  </p>
                </div>
                <button
                  onClick={() => handleDownload("specialties", "ai_specialty_classifications.xlsx")}
                  disabled={downloading === "specialties"}
                  className="mt-4 w-full py-2 px-3 rounded-xl border border-border bg-surface-muted hover:bg-surface text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === "specialties" ? "Compiling..." : "Download Taxonomy Matrix (Excel)"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── USER GUIDE & FAQ SECTION ─────────────────────────── */}
      <section id="faq" className="py-16 px-6 max-w-4xl mx-auto border-b border-border">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clear User Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-2">
            Everything you need to understand how CareData AI processes healthcare data.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              What format of provider data can I upload?
            </h3>
            <p className="text-foreground-muted mt-2 leading-relaxed">
              CareData AI accepts standard Microsoft Excel (.xlsx) workbooks and CSV files containing healthcare provider rosters. The ingestion wizard automatically maps column headers (Doctor Name, Practice, Phone, Address, Suburb, Specialty notes) and provides a pre-flight preview before processing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Are my original uploaded values ever lost or overwritten?
            </h3>
            <p className="text-foreground-muted mt-2 leading-relaxed">
              <strong>Never.</strong> Per medical data governance regulations, CareData AI retains the raw uploaded strings permanently in the database. When an analyst saves a corrected phone number or approved specialty, the accepted value is updated while the original value remains permanently locked for audit inspection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Does CareData AI handle sensitive patient health information (PHI)?
            </h3>
            <p className="text-foreground-muted mt-2 leading-relaxed">
              No. CareData AI is designed strictly for healthcare provider intelligence, practitioner directory management, and clinical network analytics. It does not ingest patient records, consultation histories, or clinical health outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-12 px-6 max-w-7xl mx-auto text-xs text-foreground-muted">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
          <CareDataLogo size="md" />
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors font-medium">
              Analyst Portal
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/upload" className="hover:text-foreground transition-colors font-medium">
              Upload Dataset
            </Link>
            <Link href="/analytics" className="hover:text-foreground transition-colors font-medium">
              Export Center
            </Link>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 CareData AI Platform. All rights reserved. Built for Global Primary Care Intelligence.</span>
          <span className="font-mono text-brand-600 dark:text-brand-400">Global Provider Directory • Multi-Jurisdiction Engine</span>
        </div>
      </footer>

      {/* Platform Guide & Download Specs Modal */}
      <PlatformGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}
