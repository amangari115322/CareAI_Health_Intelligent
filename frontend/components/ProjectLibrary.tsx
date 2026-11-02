"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  ArrowRight,
  GripVertical,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROJECT_TEMPLATES,
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type ProjectTemplate,
} from "@/lib/projectTemplates";

interface ProjectLibraryProps {
  onSelectProject: (project: ProjectTemplate) => void;
  onDragStartProject?: (project: ProjectTemplate) => void;
  onDragEndProject?: () => void;
  activeProjectId?: string | null;
}

const CATEGORY_STYLES: Record<string, { badge: string }> = {
  "Computer Vision": {
    badge: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  "AI/ML": {
    badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  "Generative AI": {
    badge: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25",
  },
  NLP: {
    badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  "Data Analytics": {
    badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  SaaS: {
    badge: "text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
  "Full Stack": {
    badge: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
};

export default function ProjectLibrary({
  onSelectProject,
  onDragStartProject,
  onDragEndProject,
  activeProjectId,
}: ProjectLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Filter templates based on category and query
  const filteredTemplates = useMemo(() => {
    return PROJECT_TEMPLATES.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = p.title.toLowerCase().includes(q);
      const inDesc = p.desc.toLowerCase().includes(q);
      const inCategory = p.category.toLowerCase().includes(q);
      const inTechs = p.techs.some((t) => t.toLowerCase().includes(q));

      return inTitle || inDesc || inCategory || inTechs;
    });
  }, [selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: PROJECT_TEMPLATES.length };
    PROJECT_TEMPLATES.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleDragStart = (e: React.DragEvent, project: ProjectTemplate) => {
    setDraggingId(project.id);
    e.dataTransfer.setData("application/json", JSON.stringify(project));
    e.dataTransfer.setData("text/plain", project.fullPrompt);
    e.dataTransfer.effectAllowed = "copyMove";

    if (onDragStartProject) {
      onDragStartProject(project);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    if (onDragEndProject) {
      onDragEndProject();
    }
  };

  return (
    <section className="space-y-4 pt-1">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <Layers size={16} className="text-purple-500" />
              Project Template Library
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/20">
              {PROJECT_TEMPLATES.length} templates
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag any template into the prompt box above or click to select
          </p>
        </div>

        {/* Quick hint badge */}
        <div className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/[0.07] border border-purple-500/20 px-2.5 py-1 rounded-lg">
          <GripVertical size={12} />
          <span>Drag card & drop into prompt box</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by model (e.g. YOLO, ResNet, RAG), framework, or keyword..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-surface-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500/50 focus:shadow-[0_0_16px_rgba(139,92,246,0.12)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills (horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {PROJECT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all duration-150 flex items-center gap-1.5 border",
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30 font-semibold"
                    : "bg-surface-card hover:bg-surface-2 border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-surface-2 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Templates */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTemplates.map((template) => {
            const isDragging = draggingId === template.id;
            const isActive = activeProjectId === template.id;
            const style = CATEGORY_STYLES[template.category] || {
              badge: "text-purple-600 bg-purple-500/10 border-purple-500/20",
            };

            return (
              <div
                key={template.id}
                draggable
                onDragStart={(e) => handleDragStart(e, template)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectProject(template)}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all duration-200 text-left cursor-grab active:cursor-grabbing flex flex-col justify-between select-none",
                  "bg-surface-card hover:bg-surface-card/95 hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(139,92,246,0.14)]",
                  isDragging &&
                    "opacity-50 scale-98 border-purple-500 shadow-[0_0_24px_rgba(139,92,246,0.35)] ring-2 ring-purple-500/40",
                  isActive
                    ? "border-purple-500/70 bg-purple-500/[0.04] shadow-[0_0_16px_rgba(139,92,246,0.18)]"
                    : "border-border"
                )}
              >
                <div>
                  {/* Top Bar: Icon + Category Badge + Drag Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                        {template.icon}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border",
                          style.badge
                        )}
                      >
                        {template.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground/60 group-hover:text-purple-500 transition-colors">
                      <span className="text-[10px] font-mono hidden group-hover:inline transition-opacity">
                        Drag or Click
                      </span>
                      <GripVertical size={14} className="shrink-0" />
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs sm:text-[13px] font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-snug">
                    {template.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {template.desc}
                  </p>
                </div>

                {/* Bottom Tech Pills & Action Row */}
                <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {template.techs.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-foreground/80 border border-border/60"
                      >
                        {t}
                      </span>
                    ))}
                    {template.techs.length > 3 && (
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-surface-2 text-muted-foreground">
                        +{template.techs.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-purple-500 text-xs shrink-0 font-medium">
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-2 bg-surface-card/40">
          <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Search size={16} />
          </div>
          <p className="text-xs font-semibold text-foreground">
            No templates matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Try a different search term or select another category filter above.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium pt-1"
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}
