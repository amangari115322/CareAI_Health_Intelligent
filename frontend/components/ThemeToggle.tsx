"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("blueprintai-theme") as "dark" | "light" | null;
    const initialTheme = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("blueprintai-theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg bg-white/5" />;
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-500/40 bg-slate-100 dark:bg-white/5 hover:bg-purple-500/10 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm relative group"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon size={16} className="text-purple-600 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
