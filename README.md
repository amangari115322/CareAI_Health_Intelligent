# CareData AI 🏥

> **Professional Healthcare Provider Data Intelligence Platform**  
> Turn healthcare provider data into research-ready information. Ingest messy CSV/Excel rosters, standardize Australian practitioner formats, classify specialties with Groq AI, flag duplicate candidates, and export verified datasets.

---

## Overview

**CareData AI** is a modern, privacy-respecting healthcare intelligence platform built to manage and standardize practitioner registries. Designed with a forest-green and charcoal identity, CareData AI enforces strict provenance tracking: original uploaded values are permanently preserved, duplicate candidates are flagged for human-in-the-loop inspection rather than silently merged, and classifications are attributed with model confidence scores and clinical reasoning.

---

## 10 Core Application Pages

| # | Page | Route | Description |
|---|---|---|---|
| 1 | **Landing Page** | `/` | Product introduction, hero with live preview, 3 feature cards, 4-step workflow strip, and demo entry. |
| 2 | **Login Page** | `/login` | Centred demo card, password visibility toggle, desktop dashboard preview, and one-click entry. |
| 3 | **Dashboard** | `/dashboard` | 6 executive metric cards, 4 interactive charts, recent activity timeline, and active job card. |
| 4 | **Upload Data** | `/upload` | Drag-and-drop CSV/XLSX ingestion, sample pilot loader (150 Sydney GPs), column mapping, and confirmation modal. |
| 5 | **Data Cleaning & Validation** | `/cleaning` | 5 summary cards, 6 issue tabs, issues table, and slide-over correction panel with original value preservation. |
| 6 | **AI Specialty Classification** | `/classification` | 4 summary cards, classification table, Groq LLM inference, clinical reasoning, and category editor. |
| 7 | **Data Explorer** | `/explorer` | Multi-filter search (suburb, specialty, quality score, verification status), sortable table, and deep-dive practitioner dossier drawer. |
| 8 | **Analytics & Reports** | `/analytics` | Overview metrics, specialty distribution, duplicate outcomes, and 5 distinct downloadable Excel/CSV reports. |
| 9 | **Data Collection** | `/collection` | Public registry connectors (AHPRA, Healthdirect NHSD) with permission guardrails and compliance empty state. |
| 10 | **Settings** | `/settings` | General defaults (Sydney, Australia), agreed GP specialty taxonomy manager, quality rules, and duplicate thresholds. |

---

## Real 5-Stage Processing Pipeline

1. **Data Cleaning**: Standardizes Australian doctor prefixes (`Dr.`, `A/Prof`, `Prof.`), casing, and telephone formats (`(02) XXXX XXXX` and `04XX XXX XXX`).
2. **Duplicate Detection**: Pairwise similarity scoring linking practitioners at identical clinics or with high name similarity scores (>80%). Never silently deletes records.
3. **AI Classification**: Groq LLM inference (`qwen/qwen3.8-27b`) categorizing clinical notes into the agreed Australian GP Taxonomy with confidence scores and clinical explanations, supported by a deterministic offline fallback.
4. **Data Validation**: Checks required fields, invalid phone formats, missing websites, and computes weighted completeness scores.
5. **Save Results & Audit Log**: Retains original uploaded values, records accepted values, timestamps, and provenance evidence.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.11+), zero external database required (uses Python standard library SQLite for local ACID reliability), `openpyxl` for Excel generation.
- **AI Engine**: Groq API integration with secure backend environment variable handling; fallback deterministic rule taxonomy engine when offline.

---

## Quick Start

### 1. Backend Server
```bash
# Activate virtual environment
backend\venv\Scripts\activate

# Run FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend
```

### 2. Frontend Server
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Data Boundary & Disclaimer

> **Disclaimer:** CareData AI is designed exclusively for healthcare provider research, workforce analytics, and directory intelligence. It is not intended for patient care, clinical decision-making, or diagnostic workflows.
