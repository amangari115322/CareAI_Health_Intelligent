"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe2, ChevronDown, Check } from "lucide-react";

export interface JurisdictionOption {
  id: string;
  label: string;
  flag: string;
  region: string;
  standards: string;
}

export const JURISDICTIONS: JurisdictionOption[] = [
  {
    id: "Global",
    label: "Global Standards",
    flag: "🌐",
    region: "Worldwide",
    standards: "WHO ICD-11 & HL7 FHIR Interoperability",
  },
  {
    id: "Australia",
    label: "Australia",
    flag: "🇦🇺",
    region: "Sydney / NSW",
    standards: "AHPRA & RACGP Primary Care Taxonomy",
  },
  {
    id: "USA",
    label: "United States",
    flag: "🇺🇸",
    region: "Nationwide",
    standards: "CMS National Provider Identifier (NPI)",
  },
  {
    id: "India",
    label: "India",
    flag: "🇮🇳",
    region: "Pan-India",
    standards: "NMC & Ayushman Bharat (ABDM) Registries",
  },
  {
    id: "Nepal",
    label: "Nepal",
    flag: "🇳🇵",
    region: "Kathmandu / Regions",
    standards: "NMC & Ministry of Health & Population",
  },
  {
    id: "International",
    label: "International / Russia",
    flag: "🇷🇺",
    region: "Eurasia / International",
    standards: "WHO Registry & Ministry of Health",
  },
];

interface GlobalJurisdictionDropdownProps {
  value?: string;
  onChange?: (jurisdictionId: string) => void;
  className?: string;
  align?: "left" | "right";
}

export const GlobalJurisdictionDropdown: React.FC<GlobalJurisdictionDropdownProps> = ({
  value = "Global",
  onChange,
  className = "",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected =
    JURISDICTIONS.find((j) => j.id.toLowerCase() === value.toLowerCase()) ||
    JURISDICTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (j: JurisdictionOption) => {
    if (onChange) onChange(j.id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        title="Select Healthcare Regulatory Jurisdiction"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{selected.flag}</span>
          <span className="truncate max-w-[130px] sm:max-w-[160px]">{selected.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-foreground-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-surface shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/70 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
              Regulatory Jurisdiction
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              6 Standards
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {JURISDICTIONS.map((j) => {
              const isSelected = j.id.toLowerCase() === selected.id.toLowerCase();
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => handleSelect(j)}
                  className={`w-full flex items-start justify-between gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/25"
                      : "text-foreground hover:bg-surface-muted/80 hover:text-foreground font-medium"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none mt-0.5">{j.flag}</span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                        <span>{j.label}</span>
                        <span className="text-[10px] font-normal text-foreground-muted">
                          ({j.region})
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground-muted/80 leading-snug">
                        {j.standards}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-2 border-t border-border/70 mt-1.5 text-[10px] text-foreground-muted flex items-center justify-between">
            <span>Clinical Registry Rules</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Active Sync
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
