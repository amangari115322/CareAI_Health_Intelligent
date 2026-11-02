"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { api, DashboardStats } from "../lib/caredataApi";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const isPublicPage = pathname === "/" || pathname === "/login";

  useEffect(() => {
    if (!isPublicPage) {
      api.getStats().then(setStats).catch(() => {});
    }
  }, [pathname, isPublicPage]);

  if (isPublicPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Fixed collapsible sidebar */}
      <Sidebar stats={{ needs_review: stats?.needs_review, potential_duplicates: stats?.potential_duplicates }} />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
