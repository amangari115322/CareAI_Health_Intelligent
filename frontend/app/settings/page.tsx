"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Sliders,
  Info,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  X,
  Search,
  Globe2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { api } from "../../lib/caredataApi";

const QUICK_LOCATIONS = [
  { label: "India", query: "India", flag: "🇮🇳", sub: "NMC / ABDM" },
  { label: "Russia", query: "Russia", flag: "🇷🇺", sub: "WHO / Moscow" },
  { label: "Sydney, Australia", query: "Sydney", flag: "🇦🇺", sub: "AHPRA / RACGP" },
  { label: "United States", query: "United States", flag: "🇺🇸", sub: "CMS / NPI" },
  { label: "Nepal", query: "Nepal", flag: "🇳🇵", sub: "NMC / MoHP" },
  { label: "Global", query: "", flag: "🌐", sub: "All Regions" },
];

const DEFAULT_SYSTEM_SETTINGS = {
  general: {
    default_project: "sydney-gp-pilot",
    default_location: "Global",
  },
  taxonomy: [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics & Gynaecology",
    "Ophthalmology",
    "Orthopaedics",
    "Paediatrics",
    "Psychiatry",
    "Respiratory Medicine",
  ],
  quality_rules: {
    require_doctor_name: true,
    require_specialty: true,
    require_phone: true,
    validate_au_phone_format: true,
    flag_missing_website: false,
  },
  review_preferences: {
    auto_approve_ai_threshold: 0.88,
    duplicate_similarity_threshold: 0.80,
  },
  ai_security: {
    groq_api_key_configured: true,
    key_storage: "Server-side environment (.env) — Never exposed to browser",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newTaxonomyCategory, setNewTaxonomyCategory] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 1. Check local storage first for persisted client settings
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("caredata_system_settings");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
              setSettings((prev: any) => ({ ...prev, ...parsed }));
            }
          } catch (_) {}
        }
      }

      // 2. Fetch from backend if online
      const data = await api.getSettings();
      if (data && Object.keys(data).length > 0 && data.general) {
        setSettings((prev: any) => ({ ...prev, ...data }));
        if (typeof window !== "undefined") {
          localStorage.setItem("caredata_system_settings", JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn("Backend settings API offline; running client settings.", e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("caredata_system_settings", JSON.stringify(settings));
      }
      try {
        await api.saveSettings(settings);
      } catch (be) {
        console.warn("Backend save skipped or offline:", be);
      }
      setFeedback("Settings and default research location saved successfully.");
      setTimeout(() => setFeedback(null), 3500);
    } catch (e) {
      console.error("Save error:", e);
      setFeedback("Settings saved to local storage.");
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleSearchLocationInExplorer = async () => {
    const loc = settings?.general?.default_location || "";
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("caredata_system_settings", JSON.stringify(settings));
      }
      api.saveSettings(settings).catch(() => {});
    } catch (e) {}
    router.push(`/explorer?search=${encodeURIComponent(loc.trim())}`);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchLocationInExplorer();
    }
  };

  const handleSelectQuickLocation = (loc: { label: string; query: string }) => {
    const updated = {
      ...settings,
      general: { ...settings.general, default_location: loc.label },
    };
    setSettings(updated);
  };

  const handleResetDefaults = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("caredata_system_settings");
      }
      try {
        await api.resetSettings();
      } catch (_) {}
      setSettings(DEFAULT_SYSTEM_SETTINGS);
      setFeedback("Settings restored to system defaults.");
      setConfirmResetOpen(false);
      setTimeout(() => setFeedback(null), 3500);
    } catch (e) {
      setSettings(DEFAULT_SYSTEM_SETTINGS);
      setFeedback("Settings restored to system defaults.");
      setConfirmResetOpen(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleAddCategory = () => {
    if (!newTaxonomyCategory.trim() || !settings?.taxonomy) return;
    if (settings.taxonomy.includes(newTaxonomyCategory.trim())) return;
    setSettings({
      ...settings,
      taxonomy: [...settings.taxonomy, newTaxonomyCategory.trim()],
    });
    setNewTaxonomyCategory("");
  };

  const handleRemoveCategory = (cat: string) => {
    if (!settings?.taxonomy) return;
    setSettings({
      ...settings,
      taxonomy: settings.taxonomy.filter((c: string) => c !== cat),
    });
  };

  const currentLocation = settings?.general?.default_location || "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 pt-1">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            System Settings & Validation Rules
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Configure validation rules, duplicate matching thresholds, and the agreed healthcare taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-foreground-muted" /> Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* ── 1. GENERAL SETTINGS WITH WORKABLE RESEARCH LOCATION SEARCH ── */}
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> General Workspace Defaults
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            Active Multi-Jurisdiction
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Active Project Field */}
          <div>
            <label className="text-foreground-muted font-medium block mb-1.5">Active Workspace Slug</label>
            <input
              type="text"
              value={settings.general?.default_project ?? "sydney-gp-pilot"}
              disabled
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-muted border border-border text-foreground-muted font-mono cursor-not-allowed opacity-80"
            />
            <span className="text-[10px] text-foreground-muted mt-1 block">Read-only project workspace slug</span>
          </div>

          {/* Default Research Location Search Field */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="text-foreground font-bold">Default Research Location & Search Scope</label>
              </div>

              {Boolean(currentLocation) && (
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, default_location: "" },
                    })
                  }
                  className="text-[11px] text-foreground-muted hover:text-red-500 font-medium transition-colors flex items-center gap-0.5"
                  title="Clear location field"
                >
                  <X className="w-3 h-3" /> Clear Location
                </button>
              )}
            </div>

            {/* Input with inline actions */}
            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, default_location: e.target.value },
                    })
                  }
                  onKeyDown={handleLocationKeyDown}
                  placeholder="Type location (e.g. India, Russia, Sydney, USA, Nepal) and press Enter..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
                />
                {Boolean(currentLocation) && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, default_location: "" },
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-foreground-muted hover:text-foreground rounded transition-colors"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchLocationInExplorer}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                  title="Search this location in the live Data Explorer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search in Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-muted text-foreground shadow-sm transition-all whitespace-nowrap"
                  title="Save as default workspace location"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Quick Country / Location Select Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-foreground-muted block">
                Quick Select Healthcare Jurisdiction:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {QUICK_LOCATIONS.map((loc) => {
                  const isActive =
                    currentLocation.toLowerCase().includes(loc.label.toLowerCase()) ||
                    (loc.label === "Global" && !currentLocation);
                  return (
                    <button
                      key={loc.label}
                      type="button"
                      onClick={() => handleSelectQuickLocation(loc)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white font-semibold shadow-sm"
                          : "bg-surface border border-border text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      <span>{loc.flag}</span>
                      <span>{loc.label}</span>
                      <span className={`text-[9px] ${isActive ? "text-emerald-100" : "text-foreground-muted"}`}>
                        ({loc.sub})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purpose & Help Explanation Banner */}
            <div className="p-3 rounded-xl bg-surface border border-border/70 text-[11px] text-foreground-muted leading-relaxed">
              <span className="font-semibold text-foreground block mb-0.5">
                💡 Purpose of this section:
              </span>
              Defines the active territorial jurisdiction for clinical validation rules, phone number standards (+91, +7, +1, (02)), and practitioner searches.
              Typing a country or city and clicking <strong className="text-foreground">Search in Explorer</strong> (or pressing <strong className="text-foreground">Enter</strong>) will instantly query all doctors, clinics, and specialties registered in that region.
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SPECIALTY CATEGORIES TAXONOMY ─────────────────── */}
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Agreed Specialty Taxonomy (Global & RACGP)
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Categories used by the Groq AI model and rule engine to categorize provider notes across the platform.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {settings.taxonomy?.length || 0} Categories
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {settings.taxonomy?.map((cat: string) => (
              <div
                key={cat}
                className="p-3 rounded-xl bg-surface-muted/60 border border-border flex items-center justify-between gap-2 hover:border-emerald-500/30 transition-colors"
              >
                <span className="font-medium text-foreground truncate">{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="p-1 rounded-lg text-foreground-muted hover:text-red-500 hover:bg-surface transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newTaxonomyCategory}
              onChange={(e) => setNewTaxonomyCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              placeholder="Add new specialty category (e.g. Geriatric Medicine, Telehealth)..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. QUALITY VALIDATION CHECKS ──────────────────────── */}
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Quality Validation Checks
        </h2>

        <div className="space-y-2 text-xs">
          {[
            { key: "require_doctor_name", label: "Require Doctor Name (mandatory for cohort)" },
            { key: "require_specialty", label: "Require Specialty / Primary Discipline" },
            { key: "require_phone", label: "Flag Missing Clinic Telephone Numbers" },
            { key: "validate_au_phone_format", label: "Enforce Standard Telephone Numbering ((02) XXXX, 04XX, +91, +1, +977)" },
            { key: "flag_missing_website", label: "Flag Missing Practice Websites" },
          ].map((rule) => (
            <label
              key={rule.key}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/50 border border-border cursor-pointer hover:bg-surface-muted transition-colors"
            >
              <span className="text-foreground font-medium">{rule.label}</span>
              <input
                type="checkbox"
                checked={Boolean(settings.quality_rules?.[rule.key])}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    quality_rules: {
                      ...settings.quality_rules,
                      [rule.key]: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* ── 4. REVIEW THRESHOLDS ──────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Matching & Review Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border">
            <label className="text-foreground font-medium block mb-1">
              AI Auto-Approval Threshold
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="0.70"
                max="0.98"
                step="0.02"
                value={settings.review_preferences?.auto_approve_ai_threshold || 0.88}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    review_preferences: {
                      ...settings.review_preferences,
                      auto_approve_ai_threshold: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-emerald-600"
              />
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold w-12 text-right">
                {Math.round((settings.review_preferences?.auto_approve_ai_threshold || 0.88) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted mt-2">
              Classifications below this score enter the Needs Review queue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border">
            <label className="text-foreground font-medium block mb-1">
              Duplicate Candidate Similarity Ratio
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="0.65"
                max="0.95"
                step="0.05"
                value={settings.review_preferences?.duplicate_similarity_threshold || 0.80}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    review_preferences: {
                      ...settings.review_preferences,
                      duplicate_similarity_threshold: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-emerald-600"
              />
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold w-12 text-right">
                {Math.round((settings.review_preferences?.duplicate_similarity_threshold || 0.80) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted mt-2">
              Similarity threshold for linking doctor records at identical clinic phones.
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. AI ENGINE & SECURITY STATUS ─────────────────────── */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-3 text-xs">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> AI Security & Architecture
        </h2>

        <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Groq LPU Engine:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Backend Loaded & Private
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Active Model:</span>
            <span className="font-mono text-foreground font-semibold">qwen/qwen3.8-27b</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Credential Isolation:</span>
            <span className="text-foreground-muted text-[11px]">Server-side only — Never exposed to browser</span>
          </div>
        </div>
      </div>

      {/* ── 6. ABOUT CAREDATA AI ──────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-2 text-xs text-foreground-muted">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> About CareData AI
        </h2>
        <p className="leading-relaxed">
          <strong className="text-foreground">CareData AI</strong> (Version 1.0.0 Global Edition) is an enterprise healthcare data intelligence platform designed for structuring, cleaning, and verifying provider directories across international regulatory standards.
        </p>
        <p className="leading-relaxed text-[11px]">
          <strong>Intended Use:</strong> Workforce analytics, provider registry hygiene, and health systems research. Not intended for direct diagnostic patient care.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-xl text-foreground">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Reset Settings to System Defaults?
            </h3>
            <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
              This will restore all default validation rules, thresholds, and the standard agreed taxonomy list.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
