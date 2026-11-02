"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow transition-transform duration-200 group-hover:scale-105">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
            Blueprint<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="/build" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            Build
          </Link>
          <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            Projects
          </Link>
        </nav>

        {/* Auth & Theme */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/build"
            className="btn-gradient text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
