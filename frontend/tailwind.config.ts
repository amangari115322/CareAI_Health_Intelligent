import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg-color) / <alpha-value>)",
        surface: "rgb(var(--surface-color) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        "surface-card": "rgb(var(--card-bg) / <alpha-value>)",
        border: "rgb(var(--border-color) / <alpha-value>)",
        "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
        foreground: "rgb(var(--text-color) / <alpha-value>)",
        "foreground-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "foreground-subtle": "rgb(var(--text-subtle) / <alpha-value>)",
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        float: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
