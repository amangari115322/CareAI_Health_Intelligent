"use client";

import React, { useState, useEffect } from "react";
import {
  Globe2,
  ShieldCheck,
  ExternalLink,
  Database,
  X,
} from "lucide-react";
import { api } from "../../lib/caredataApi";

export default function DataCollectionPage() {
  const [data, setData] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  useEffect(() => {
    api.getCollectionSources().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Statutory Data Collection Connectors
        </h2>
        <p className="text-xs text-foreground-muted mt-0.5">
          Manage approved Australian statutory registries and public health directory integrations.
        </p>
      </div>


      {/* ── MANDATORY INITIAL EMPTY STATE (Page 10 Requirement) ─ */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-subtle space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface-muted text-foreground-muted border border-border">
                Phase 2 Roadmap
              </span>
              <span className="text-xs font-semibold text-foreground">Direct Connectors Inactive</span>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Per product specification: <strong className="text-foreground">"At first, explain that no connectors are configured yet; add this capability after upload, cleaning, classification and export work."</strong> The active pilot operates on verified practitioner spreadsheets (CSV and XLSX).
            </p>
            <div className="p-3 rounded-md bg-surface-muted border border-border text-[11px] text-foreground-muted leading-relaxed">
              <strong>Compliance Notice:</strong> CareData AI does not bypass credentials or perform unauthorized web scraping. Official statutory connectors will be activated only after formal data governance agreements.
            </div>
          </div>
        </div>
      </div>

      {/* ── PLANNED STATUTORY REGISTRIES ─────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Approved Statutory Information Connectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.configured_sources?.map((src: any) => (
            <div
              key={src.id}
              className="p-5 med-card med-card-step !cursor-default flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{src.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {src.status}
                  </span>
                </div>

                <div className="text-xs text-foreground-muted space-y-1.5">
                  <div className="flex justify-between">
                    <span>Registry Type:</span>
                    <strong className="text-foreground">{src.type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Method:</span>
                    <span className="font-mono text-foreground text-[11px]">{src.permitted_access}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Records Collected:</span>
                    <span className="font-mono text-foreground">{src.record_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Ingestion Job:</span>
                    <span className="font-mono text-foreground">{src.last_collection}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-border flex items-center justify-between">
                <a
                  href={src.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Visit Registry <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setSelectedSource(src)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-surface-muted text-foreground transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOURCE DETAIL MODAL ──────────────────────────────── */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-5 shadow-float text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">{selectedSource.name}</h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-md bg-surface-muted border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Jurisdiction:</span>
                  <span className="text-foreground font-medium">Commonwealth of Australia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Authority:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-medium">Statutory National Board</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Status:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">{selectedSource.status}</span>
                </div>
              </div>

              <p className="text-foreground-muted leading-relaxed text-[11px]">
                Upon activation, this connector enables cross-referencing of GP registration numbers against statutory medical registers, verifying licensure without manual lookup.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedSource(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-surface-muted border border-border hover:bg-surface text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
