import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/AppShell";

export const metadata: Metadata = {
  title: "CareData AI — Healthcare Data Intelligence Platform",
  description:
    "Turn healthcare provider data into research-ready information. Ingest, clean, validate, classify specialties with AI, detect duplicates, and export verified reports.",
  keywords: ["Healthcare Data", "Provider Intelligence", "AI Specialty Classification", "Data Cleaning", "Sydney GPs"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
