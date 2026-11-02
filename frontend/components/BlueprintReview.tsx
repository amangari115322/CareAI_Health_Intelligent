"use client";

import { useState } from "react";
import {
  FileCheck2,
  Database,
  Key,
  FolderTree,
  Terminal,
  Sparkles,
  ExternalLink,
  Folder,
  FileCode,
  FileText,
  CheckCircle2,
  Layers,
} from "lucide-react";
import type { BlueprintSpec } from "@/lib/api";

interface BlueprintReviewProps {
  spec: BlueprintSpec;
  selectedTechs: string[];
  onGenerate: () => void;
  onBackToArchitecture: () => void;
  isLoading?: boolean;
}

export default function BlueprintReview({
  spec,
  selectedTechs,
  onGenerate,
  onBackToArchitecture,
  isLoading,
}: BlueprintReviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "dataset" | "api_keys" | "files">("overview");

  return (
    <div className="space-y-6 animate-in">
      {/* Title & Domain Card */}
      <div className="rounded-2xl p-6 border border-border bg-gradient-to-br from-purple-500/10 via-slate-50/50 dark:via-[#0d0d1e]/90 to-blue-500/10 backdrop-blur-2xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              {spec.domain || "System Architecture"}
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Verified Blueprint
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {spec.title}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {spec.summary}
          </p>

          {/* Active tech stack pill bar */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Layers size={13} /> Stack:
            </span>
            {selectedTechs.slice(0, 8).map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md"
              >
                {tech}
              </span>
            ))}
            {selectedTechs.length > 8 && (
              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md">
                +{selectedTechs.length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8">
        {[
          { id: "overview", label: "Overview & Features", icon: FileCheck2 },
          { id: "dataset", label: "Dataset Instructions", icon: Database, badge: spec.dataset_info?.required ? "Required" : null },
          { id: "api_keys", label: "API Keys & Secrets", icon: Key, count: spec.api_keys.length },
          { id: "files", label: "Generated File Tree", icon: FolderTree, count: spec.folder_tree.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "dataset" | "api_keys" | "files")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white dark:bg-purple-500/20 text-purple-950 dark:text-white border border-slate-200 dark:border-purple-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={14} className={isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="glass border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Sparkles size={16} /> Key Capabilities & Features
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
              {spec.key_features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5"
                >
                  <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick setup commands */}
          {spec.setup_commands.length > 0 && (
            <div className="glass border border-border rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 flex items-center gap-2">
                <Terminal size={16} /> Planned Setup Sequence
              </h3>
              <div className="space-y-1.5 font-mono text-xs text-slate-100 bg-slate-900 dark:bg-black/60 p-4 rounded-xl border border-slate-800 dark:border-white/5 overflow-x-auto shadow-inner">
                {spec.setup_commands.map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-purple-400 select-none">$</span>
                    <span className="text-emerald-300">{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dataset Instructions */}
      {activeTab === "dataset" && (
        <div className="glass border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {spec.dataset_info?.name || "Dataset Configuration"}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Source: <span className="text-slate-800 dark:text-slate-300 font-medium">{spec.dataset_info?.source}</span>
              </p>
            </div>

            {spec.dataset_info?.download_url && (
              <a
                href={spec.dataset_info.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white shrink-0 shadow-sm"
              >
                <span>Download Dataset</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-800 dark:text-cyan-300">
              Where to Place the Files
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {spec.dataset_info?.instructions}
            </p>
          </div>

          {/* Directory placement breakdown */}
          {spec.dataset_info?.sample_files && spec.dataset_info.sample_files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                Expected Directory Structure
              </p>
              <div className="p-3 rounded-xl bg-slate-900 dark:bg-black/60 border border-slate-800 dark:border-white/5 font-mono text-xs space-y-1 text-slate-200">
                {spec.dataset_info.sample_files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Folder size={12} className="text-cyan-400" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: API Keys & Secrets */}
      {activeTab === "api_keys" && (
        <div className="glass border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key size={18} className="text-amber-500 dark:text-amber-400" />
              API Keys & Environment Credentials
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configured via the generated <code className="text-purple-600 dark:text-purple-300 font-mono">.env</code> file in the project root.
            </p>
          </div>

          {spec.api_keys.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400">
              No third-party API keys required. This project runs completely self-contained!
            </div>
          ) : (
            <div className="space-y-3">
              {spec.api_keys.map((key) => (
                <div
                  key={key.env_var}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/8 space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{key.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/25 text-purple-700 dark:text-purple-300">
                        {key.env_var}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{key.description}</p>
                  </div>

                  {key.portal_url && (
                    <a
                      href={key.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium shrink-0 underline"
                    >
                      Get Key <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: File Structure Tree */}
      {activeTab === "files" && (
        <div className="glass border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree size={18} className="text-purple-600 dark:text-purple-400" />
              Generated Project Structure
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              All files below are dynamically created and packaged into the final ZIP download.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 dark:border-white/8 bg-slate-900 dark:bg-black/60 p-4 font-mono text-xs space-y-1.5 max-h-[380px] overflow-y-auto">
            {spec.folder_tree.map((node, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {node.type === "folder" ? (
                    <Folder size={14} className="text-purple-400 shrink-0" />
                  ) : node.name.endsWith(".py") ? (
                    <FileCode size={14} className="text-blue-400 shrink-0" />
                  ) : (
                    <FileText size={14} className="text-slate-400 shrink-0" />
                  )}
                  <span className={node.type === "folder" ? "text-purple-300 font-bold" : "text-slate-200"}>
                    {node.path}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[240px]">
                  {node.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <button
          onClick={onBackToArchitecture}
          type="button"
          className="px-5 py-3 rounded-xl border border-border text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition-all"
        >
          ← Edit Architecture & Stack
        </button>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          type="button"
          className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Project...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Working Project →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
