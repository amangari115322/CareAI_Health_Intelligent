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
  LogOut,
  SlidersHorizontal,
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
    { name: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
    { name: "Data Collection", href: "/collection", icon: Globe2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col transition-all duration-200 z-30 select-none overflow-hidden ${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-[#06241a] via-[#093223] to-[#052016] border-r border-emerald-900/40 text-white shadow-xl`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-emerald-800/40">
        <Link href="/dashboard" className="flex items-center overflow-hidden">
          <CareDataLogo
            size={collapsed ? "sm" : "sm"}
            showText={!collapsed}
            inverted={true}
          />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-emerald-800/50 transition-colors ml-1"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                isActive
                  ? "bg-[#0e7552] text-white font-semibold shadow-md shadow-emerald-950/40"
                  : "text-emerald-100/75 hover:text-white hover:bg-emerald-800/35 font-medium"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? "text-white" : "text-emerald-300/80"
                }`}
              />
              {!collapsed && <span className="flex-1 truncate tracking-tight">{item.name}</span>}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Watermark Heart / Pulse Vector graphic matching screenshot */}
      <div className="relative p-4 mt-auto">
        <div className="absolute -bottom-6 -left-6 w-36 h-36 opacity-10 pointer-events-none text-emerald-400">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 15 C30 5, 5 30, 25 55 L50 85 L75 55 C95 30, 70 5, 50 15 Z"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M15 50 H35 L42 35 L50 65 L58 38 L65 52 H85"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {!collapsed ? (
          <div className="relative z-10 space-y-2">
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-[11px] text-emerald-200/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">Active Dataset</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Global Pilot
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/70 leading-relaxed truncate">
                Multi-Jurisdiction Healthcare
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-200/70 hover:text-white hover:bg-emerald-800/40 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Back to Landing
            </Link>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center p-2 text-emerald-200/70 hover:text-white hover:bg-emerald-800/40 rounded-lg"
            title="Back to Landing"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
};
