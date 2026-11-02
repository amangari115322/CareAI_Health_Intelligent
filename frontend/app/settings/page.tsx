"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { api } from "../../lib/caredataApi";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newTaxonomyCategory, setNewTaxonomyCategory] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.saveSettings(settings);
      setFeedback("Settings saved successfully.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await api.resetSettings();
      await loadSettings();
      setFeedback("Settings restored to system defaults.");
      setConfirmResetOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      alert("Failed to reset settings");
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

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-xs text-foreground-muted">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            System Settings & Validation Rules
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Configure validation rules, duplicate matching thresholds, and the agreed GP taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>


      {feedback && (
        <div className="p-3 rounded-md bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── 1. GENERAL SETTINGS ──────────────────────────────── */}
      <div className="p-5 med-card med-card-step !cursor-default space-y-3.5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" /> General Workspace Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="text-foreground-muted block mb-1">Active Pilot Project</label>
            <input
              type="text"
              value={settings.general?.default_project || "sydney-gp-pilot"}
              disabled
              className="w-full px-3 py-1.5 text-xs rounded-md bg-surface-muted border border-border text-foreground-muted font-mono"
            />
          </div>
          <div>
            <label className="text-foreground-muted block mb-1">Default Research Location</label>
            <input
              type="text"
              value={settings.general?.default_location || "Sydney, Australia"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, default_location: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 text-xs rounded-md bg-surface border border-border text-foreground focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* ── 2. SPECIALTY CATEGORIES TAXONOMY ─────────────────── */}
      <div className="p-5 med-card med-card-step !cursor-default space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Agreed Australian GP Taxonomy
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Categories used to categorize provider notes across the platform.
            </p>
          </div>
          <span className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold">
            {settings.taxonomy?.length || 0} Categories
          </span>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {settings.taxonomy?.map((cat: string) => (
              <div
                key={cat}
                className="p-2.5 rounded-md bg-surface-muted border border-border flex items-center justify-between gap-2"
              >
                <span className="font-medium text-foreground truncate">{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="p-1 rounded text-foreground-muted hover:text-red-500 transition-colors"
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
              placeholder="Add specialty category..."
              className="flex-1 px-3 py-1.5 text-xs rounded-md bg-surface border border-border text-foreground focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleAddCategory}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white flex items-center gap-1 shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. QUALITY VALIDATION RULES ───────────────────────── */}
      <div className="p-5 med-card med-card-step !cursor-default space-y-3.5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Quality Validation Checks
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { key: "require_doctor_name", label: "Require Doctor Name (mandatory for cohort)" },
            { key: "require_specialty", label: "Require Specialty / Primary Discipline" },
            { key: "require_phone", label: "Flag Missing Clinic Telephone Numbers" },
            { key: "validate_au_phone_format", label: "Enforce Australian Phone Numbering Standard ((02) XXXX XXXX or 04XX)" },
            { key: "flag_missing_website", label: "Flag Missing Practice Websites" },
          ].map((rule) => (
            <label
              key={rule.key}
              className="flex items-center justify-between p-2.5 rounded-md bg-surface-muted border border-border cursor-pointer hover:bg-surface-muted/80 transition-colors"
            >
              <span className="text-foreground">{rule.label}</span>
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
                className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* ── 4. REVIEW THRESHOLDS ──────────────────────────────── */}
      <div className="p-5 med-card med-card-step !cursor-default space-y-3.5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Matching & Review Thresholds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3 rounded-lg bg-surface-muted border border-border">
            <label className="text-foreground-muted block mb-1 font-medium">
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
                className="flex-1 accent-brand-600"
              />
              <span className="font-mono text-brand-600 dark:text-brand-400 font-bold w-10 text-right">
                {Math.round((settings.review_preferences?.auto_approve_ai_threshold || 0.88) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1.5">
              Classifications below this score enter the Needs Review queue.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-muted border border-border">
            <label className="text-foreground-muted block mb-1 font-medium">
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
                className="flex-1 accent-brand-600"
              />
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold w-10 text-right">
                {Math.round((settings.review_preferences?.duplicate_similarity_threshold || 0.80) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-1.5">
              Similarity threshold for linking doctor records at identical clinic phones.
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. AI ENGINE & SECURITY STATUS ─────────────────────── */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle space-y-2.5 text-xs">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" /> AI Security & Architecture
        </h3>

        <div className="p-3 rounded-md bg-surface-muted border border-border space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Groq LPU Engine:</span>
            <span className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Backend Loaded & Private
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Active Model:</span>
            <span className="font-mono text-foreground font-medium">qwen/qwen3.8-27b</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Credential Isolation:</span>
            <span className="text-foreground-muted text-[11px]">Server-side only — Never exposed to browser</span>
          </div>
        </div>
      </div>

      {/* ── 6. ABOUT CAREDATA AI ──────────────────────────────── */}
      <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle space-y-2 text-xs text-foreground-muted">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" /> About CareData AI
        </h3>
        <p className="leading-relaxed">
          <strong className="text-foreground">CareData AI</strong> (Version 1.0.0 Research Edition) is a healthcare provider intelligence platform designed for structuring, cleaning, and managing provider directories.
        </p>
        <p className="leading-relaxed text-[11px]">
          <strong>Intended Use:</strong> Workforce analytics, provider registry hygiene, and health systems research. Not intended for direct diagnostic patient care.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-5 shadow-float text-foreground">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Reset Settings to System Defaults?
            </h3>
            <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
              This will restore all default validation rules, thresholds, and the standard agreed GP taxonomy list.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-brand-700 hover:bg-brand-600 text-white transition-colors"
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
