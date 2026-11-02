"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CareDataLogo } from "./CareDataLogo";
import {
  LayoutDashboard,
  UploadCloud,
  Sparkles,
  CheckSquare,
  Search,
  BarChart3,
  Globe2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  stats?: {
    needs_review?: number;
    potential_duplicates?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ stats }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Data", href: "/upload", icon: UploadCloud },
    {
      name: "Data Cleaning",
      href: "/cleaning",
      icon: CheckSquare,
      badge: stats?.needs_review ? `${stats.needs_review}` : undefined,
    },
    { name: "AI Classification", href: "/classification", icon: Sparkles },
    { name: "Data Explorer", href: "/explorer", icon: Search },
    { name: "Reports & Export", href: "/analytics", icon: BarChart3 },
    { name: "Data Collection", href: "/collection", icon: Globe2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-surface transition-all duration-200 z-30 select-none ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3.5 border-b border-border">
        <Link href="/dashboard" className="flex items-center overflow-hidden">
          <CareDataLogo size={collapsed ? "sm" : "sm"} showText={!collapsed} />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors ml-1"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-subtle"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-muted/60 font-medium"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? "text-emerald-500 dark:text-emerald-400" : "text-foreground-muted"
                }`}
              />
              {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-surface-muted border border-border text-[11px] text-foreground-muted">
              <span className="font-semibold text-foreground block mb-0.5">Active Dataset:</span>
              Sydney GP Research Pilot (150 records)
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground-muted hover:text-foreground hover:bg-surface-muted rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Back to Landing
            </Link>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center p-2 text-foreground-muted hover:text-foreground hover:bg-surface-muted rounded"
            title="Back to Landing"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
};
