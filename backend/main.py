"""
CareData AI - Production Backend Application
Built with FastAPI, standard sqlite3 storage, Groq LLM integration with fallback,
and comprehensive healthcare data processing pipeline.
"""

import os
import io
import csv
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse, JSONResponse
from pydantic import BaseModel
from openpyxl import load_workbook

from db_store import get_connection, init_db
from pipeline import process_raw_dataset, AGREED_TAXONOMY, GROQ_API_KEY, AI_MODEL
from export_service import (
    export_cleaned_dataset, export_quality_issues,
    export_duplicate_candidates, export_ai_classifications,
    export_source_evidence
)
from seed_data import generate_150_sydney_gps, create_sample_files

app = FastAPI(
    title="CareData AI API",
    description="Professional Healthcare Provider Data Intelligence Platform",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Lifespan / Initialization
@app.on_event("startup")
def startup_event():
    init_db()
    # Check if records exist; if not, seed initial pilot dataset so analyst can immediately explore
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM providers")
    count = c.fetchone()[0]
    conn.close()
    
    # Ensure physical sample files exist
    create_sample_files(os.path.join(os.path.dirname(__file__), "data"))
    
    if count == 0:
        seed_pilot_dataset_internal()

def log_activity(action_type: str, title: str, description: str, target_id: str = ""):
    try:
        conn = get_connection()
        c = conn.cursor()
        c.execute("""
        INSERT INTO activity_log (id, action_type, title, description, target_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (f"act-{uuid.uuid4().hex[:8]}", action_type, title, description, target_id, datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print("Activity log error:", e)

def seed_pilot_dataset_internal(file_name: str = "sydney_gp_list.xlsx"):
    raw_rows = generate_150_sydney_gps()
    job_id = f"JOB-{uuid.uuid4().hex[:5].upper()}"
    processed = process_raw_dataset(raw_rows, file_name, job_id)
    
    conn = get_connection()
    c = conn.cursor()
    
    # Save job record
    now_iso = datetime.utcnow().isoformat()
    c.execute("""
    INSERT INTO jobs (id, file_name, row_count, current_stage, stage_index, status, progress, counts_json, warnings_json, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_id, file_name, len(raw_rows), "Completed", 5, "Completed", 100.0,
        json.dumps(processed["summary"]),
        json.dumps(processed["warnings"]),
        now_iso, now_iso
    ))
    
    # Insert providers
    for r in processed["records"]:
        c.execute("""
        INSERT INTO providers (
            id, project_id, collected_doctor_name, accepted_doctor_name,
            collected_specialty, accepted_specialty, ai_suggested_category, ai_confidence,
            ai_explanation, ai_status, collected_practice_name, accepted_practice_name,
            collected_address, accepted_address, suburb, state, postcode,
            collected_phone, accepted_phone, collected_website, accepted_website,
            source_name, source_url, collected_at, quality_score, quality_status,
            verification_status, has_duplicate_candidate, needs_review,
            conflicts_json, evidence_json, history_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["project_id"], r["collected_doctor_name"], r["accepted_doctor_name"],
            r["collected_specialty"], r["accepted_specialty"], r["ai_suggested_category"], r["ai_confidence"],
            r["ai_explanation"], r["ai_status"], r["collected_practice_name"], r["accepted_practice_name"],
            r["collected_address"], r["accepted_address"], r["suburb"], r["state"], r["postcode"],
            r["collected_phone"], r["accepted_phone"], r["collected_website"], r["accepted_website"],
            r["source_name"], r["source_url"], r["collected_at"], r["quality_score"], r["quality_status"],
            r["verification_status"], r["has_duplicate_candidate"], r["needs_review"],
            r["conflicts_json"], r["evidence_json"], r["history_json"]
        ))
        
    # Insert issues
    for iss in processed["issues"]:
        c.execute("""
        INSERT INTO cleaning_issues (
            id, provider_id, provider_name, field_name, original_value, suggested_value,
            issue_type, issue_description, suggested_action, status, created_at, evidence, change_history
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
        """, (
            iss["id"], iss["provider_id"], iss["provider_name"], iss["field_name"],
            iss["original_value"], iss["suggested_value"], iss["issue_type"],
            iss["issue_description"], iss["suggested_action"], iss["status"],
            iss["created_at"], iss.get("evidence", "")
        ))
        
    # Insert duplicate candidate pairs
    for dup in processed["duplicate_candidates"]:
        c.execute("""
        INSERT INTO duplicate_candidates (
            id, provider_a_id, provider_b_id, provider_a_name, provider_b_name,
            similarity_score, match_reasons, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dup["id"], dup["provider_a_id"], dup["provider_b_id"], dup["provider_a_name"],
            dup["provider_b_name"], dup["similarity_score"], dup["match_reasons"],
            dup["status"], dup["created_at"]
        ))
        
    conn.commit()
    conn.close()
    
    log_activity(
        "import",
        f"Imported {file_name}",
        f"Processed {len(raw_rows)} Sydney GP provider records. {len(processed['duplicate_candidates'])} potential duplicates flagged.",
        job_id
    )

# ── 1. HEALTH & SYSTEM STATUS ──────────────────────────────────
@app.get("/api/health")
@app.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "CareData AI",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_backend": {
            "provider": "Groq Llama 3.3 / Qwen 27B",
            "model": AI_MODEL,
            "configured": bool(GROQ_API_KEY),
            "fallback_ready": True
        }
    }

# ── 2. PROJECT & STATS (Page 3 Dashboard) ──────────────────────
@app.get("/api/project")
@app.get("/project")
def get_project():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM projects WHERE id = 'sydney-gp-pilot'")
    row = c.fetchone()
    conn.close()
    if not row:
        return {"id": "sydney-gp-pilot", "name": "Sydney GP Research Pilot", "research_location": "Sydney, Australia"}
    return dict(row)

@app.post("/api/project/reset-demo")
def reset_demo_project():
    """Resets the demo dataset to the fresh 150 Sydney GP pilot records."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM providers")
    c.execute("DELETE FROM cleaning_issues")
    c.execute("DELETE FROM duplicate_candidates")
    c.execute("DELETE FROM jobs")
    c.execute("DELETE FROM activity_log")
    conn.commit()
    conn.close()
    seed_pilot_dataset_internal("sydney_gp_list.xlsx")
    return {"message": "Demo project successfully reset with 150 Sydney GP records"}

@app.get("/api/stats")
@app.get("/stats")
def get_dashboard_metrics():
    """Returns the exact 6 metric cards required by Page 4 of the PDF."""
    conn = get_connection()
    c = conn.cursor()
    
    # 1. Total Records
    c.execute("SELECT COUNT(*) FROM providers")
    total_records = c.fetchone()[0]
    
    # 2. Unique Providers
    c.execute("SELECT COUNT(DISTINCT LOWER(accepted_doctor_name)) FROM providers")
    unique_providers = c.fetchone()[0]
    
    # 3. Data Completeness
    c.execute("SELECT AVG(quality_score) FROM providers")
    avg_score = c.fetchone()[0] or 0.0
    completeness = round(float(avg_score), 1)
    
    # 4. Potential Duplicates
    c.execute("SELECT COUNT(*) FROM duplicate_candidates WHERE status = 'pending'")
    potential_duplicates = c.fetchone()[0]
    
    # 5. AI Classified
    c.execute("SELECT COUNT(*) FROM providers WHERE ai_suggested_category != '' AND ai_suggested_category IS NOT NULL")
    ai_classified = c.fetchone()[0]
    
    # 6. Needs Review
    c.execute("SELECT COUNT(*) FROM cleaning_issues WHERE status = 'open'")
    needs_review = c.fetchone()[0]
    
    conn.close()
    
    return {
        "total_records": total_records,
        "unique_providers": unique_providers,
        "data_completeness": completeness,
        "potential_duplicates": potential_duplicates,
        "ai_classified": ai_classified,
        "needs_review": needs_review
    }

@app.get("/api/charts")
@app.get("/charts")
def get_dashboard_charts():
    """Returns data for Specialty Distribution, Data Quality Overview, Source Distribution, and Activity."""
    conn = get_connection()
    c = conn.cursor()
    
    # 1. Specialty Distribution
    c.execute("""
    SELECT COALESCE(ai_suggested_category, 'Unassigned') as category, COUNT(*) as count
    FROM providers
    GROUP BY category
    ORDER BY count DESC
    LIMIT 10
    """)
    specialty_distribution = [{"name": row["category"], "value": row["count"]} for row in c.fetchall()]
    
    # 2. Data Quality Overview
    c.execute("""
    SELECT quality_status, COUNT(*) as count
    FROM providers
    GROUP BY quality_status
    """)
    quality_overview = [{"name": row["quality_status"], "value": row["count"]} for row in c.fetchall()]
    
    # 3. Source Distribution
    c.execute("""
    SELECT source_name, COUNT(*) as count
    FROM providers
    GROUP BY source_name
    """)
    source_distribution = [{"name": row["source_name"], "value": row["count"]} for row in c.fetchall()]
    
    # 4. Processing Activity (Recent Jobs)
    c.execute("""
    SELECT id, file_name, row_count, status, start_time
    FROM jobs
    ORDER BY start_time DESC
    LIMIT 5
    """)
    processing_activity = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return {
        "specialty_distribution": specialty_distribution,
        "quality_overview": quality_overview,
        "source_distribution": source_distribution,
        "processing_activity": processing_activity
    }

@app.get("/api/activities")
@app.get("/activities")
def get_recent_activities(limit: int = 10):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

@app.get("/api/jobs/active")
@app.get("/jobs/active")
def get_active_job():
    """Returns latest or active job for the compact job card and full tracker modal."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM jobs ORDER BY start_time DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    if d.get("counts_json"):
        try:
            d["counts"] = json.loads(d["counts_json"])
        except Exception:
            d["counts"] = {}
    if d.get("warnings_json"):
        try:
            d["warnings"] = json.loads(d["warnings_json"])
        except Exception:
            d["warnings"] = []
    return d

# ── 3. UPLOAD & PREVIEW WORKFLOW (Page 5 Upload Data) ───────────
@app.post("/api/upload/preview")
async def preview_upload_file(file: UploadFile = File(None), use_sample: bool = Form(False)):
    """
    Parses CSV or XLSX file and returns first 10-20 preview rows,
    file metadata, and suggested column mappings.
    """
    rows = []
    file_name = "sydney_gp_list.xlsx"
    file_size = 0
    file_format = "XLSX"
    
    if use_sample or file is None:
        file_path = os.path.join(os.path.dirname(__file__), "data", "sydney_gp_list.xlsx")
        if not os.path.exists(file_path):
            create_sample_files(os.path.join(os.path.dirname(__file__), "data"))
        file_size = os.path.getsize(file_path)
        wb = load_workbook(file_path, read_only=True)
        ws = wb.active
        all_lines = list(ws.iter_rows(values_only=True))
        if all_lines:
            headers = [str(h or "") for h in all_lines[0]]
            for r in all_lines[1:]:
                row_dict = {headers[i]: r[i] for i in range(min(len(headers), len(r)))}
                rows.append(row_dict)
    else:
        file_name = file.filename
        content = await file.read()
        file_size = len(content)
        file_format = "CSV" if file_name.lower().endswith(".csv") else "XLSX"
        
        if file_format == "CSV":
            text = content.decode('utf-8', errors='ignore')
            reader = csv.DictReader(io.StringIO(text))
            rows = list(reader)
        else:
            wb = load_workbook(filename=io.BytesIO(content), read_only=True)
            ws = wb.active
            all_lines = list(ws.iter_rows(values_only=True))
            if all_lines:
                headers = [str(h or "") for h in all_lines[0]]
                for r in all_lines[1:]:
                    row_dict = {headers[i]: r[i] for i in range(min(len(headers), len(r)))}
                    rows.append(row_dict)

    if not rows:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data rows.")

    headers = list(rows[0].keys())
    
    # Auto-map incoming columns to standard target fields
    target_mappings = {}
    for h in headers:
        hl = h.lower().strip()
        if any(k in hl for k in ["doc", "provider", "physician", "name", "practitioner"]):
            target_mappings[h] = "Provider Name"
        elif any(k in hl for k in ["spec", "field", "discipline"]):
            target_mappings[h] = "Specialty"
        elif any(k in hl for k in ["clinic", "practice", "centre", "center", "facility"]):
            target_mappings[h] = "Practice Name"
        elif any(k in hl for k in ["addr", "suburb", "location", "street", "city"]):
            target_mappings[h] = "Address"
        elif any(k in hl for k in ["phone", "tel", "contact", "mobile"]):
            target_mappings[h] = "Phone"
        elif any(k in hl for k in ["web", "site", "domain", "url"]) and "source" not in hl:
            target_mappings[h] = "Website"
        elif any(k in hl for k in ["source", "registry", "origin"]):
            target_mappings[h] = "Source URL"
        else:
            target_mappings[h] = "Ignore"

    return {
        "file_name": file_name,
        "file_size_bytes": file_size,
        "file_format": file_format,
        "row_count": len(rows),
        "validation_status": "Valid format (CSV/XLSX)",
        "headers": headers,
        "preview_rows": rows[:15],
        "suggested_mapping": target_mappings,
        "supported_targets": [
            "Provider Name", "Specialty", "Practice Name",
            "Address", "Phone", "Website", "Source URL", "Ignore"
        ]
    }

class ProcessImportRequest(BaseModel):
    file_name: str
    column_mapping: Dict[str, str]
    use_sample: bool = False
    raw_data: Optional[List[Dict[str, Any]]] = None

@app.post("/api/upload/process")
def process_upload_pipeline(req: ProcessImportRequest):
    """
    Executes the real 5-stage processing pipeline on confirmed import.
    """
    if req.use_sample or not req.raw_data:
        raw_rows = generate_150_sydney_gps()
    else:
        raw_rows = []
        for r in req.raw_data:
            mapped_row = {}
            for src_col, target_field in req.column_mapping.items():
                if target_field != "Ignore" and src_col in r:
                    mapped_row[target_field] = r[src_col]
            raw_rows.append(mapped_row)
            
    job_id = f"JOB-{uuid.uuid4().hex[:5].upper()}"
    processed = process_raw_dataset(raw_rows, req.file_name, job_id)
    
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.utcnow().isoformat()
    
    c.execute("""
    INSERT INTO jobs (id, file_name, row_count, current_stage, stage_index, status, progress, counts_json, warnings_json, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_id, req.file_name, len(raw_rows), "Completed", 5, "Completed", 100.0,
        json.dumps(processed["summary"]),
        json.dumps(processed["warnings"]),
        now_iso, now_iso
    ))
    
    for r in processed["records"]:
        c.execute("""
        INSERT OR REPLACE INTO providers (
            id, project_id, collected_doctor_name, accepted_doctor_name,
            collected_specialty, accepted_specialty, ai_suggested_category, ai_confidence,
            ai_explanation, ai_status, collected_practice_name, accepted_practice_name,
            collected_address, accepted_address, suburb, state, postcode,
            collected_phone, accepted_phone, collected_website, accepted_website,
            source_name, source_url, collected_at, quality_score, quality_status,
            verification_status, has_duplicate_candidate, needs_review,
            conflicts_json, evidence_json, history_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["project_id"], r["collected_doctor_name"], r["accepted_doctor_name"],
            r["collected_specialty"], r["accepted_specialty"], r["ai_suggested_category"], r["ai_confidence"],
            r["ai_explanation"], r["ai_status"], r["collected_practice_name"], r["accepted_practice_name"],
            r["collected_address"], r["accepted_address"], r["suburb"], r["state"], r["postcode"],
            r["collected_phone"], r["accepted_phone"], r["collected_website"], r["accepted_website"],
            r["source_name"], r["source_url"], r["collected_at"], r["quality_score"], r["quality_status"],
            r["verification_status"], r["has_duplicate_candidate"], r["needs_review"],
            r["conflicts_json"], r["evidence_json"], r["history_json"]
        ))
        
    for iss in processed["issues"]:
        c.execute("""
        INSERT INTO cleaning_issues (
            id, provider_id, provider_name, field_name, original_value, suggested_value,
            issue_type, issue_description, suggested_action, status, created_at, evidence, change_history
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
        """, (
            iss["id"], iss["provider_id"], iss["provider_name"], iss["field_name"],
            iss["original_value"], iss["suggested_value"], iss["issue_type"],
            iss["issue_description"], iss["suggested_action"], iss["status"],
            iss["created_at"], iss.get("evidence", "")
        ))
        
    for dup in processed["duplicate_candidates"]:
        c.execute("""
        INSERT INTO duplicate_candidates (
            id, provider_a_id, provider_b_id, provider_a_name, provider_b_name,
            similarity_score, match_reasons, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dup["id"], dup["provider_a_id"], dup["provider_b_id"], dup["provider_a_name"],
            dup["provider_b_name"], dup["similarity_score"], dup["match_reasons"],
            dup["status"], dup["created_at"]
        ))
        
    conn.commit()
    conn.close()
    
    log_activity(
        "import",
        f"Completed job {job_id}",
        f"Processed {len(raw_rows)} rows from {req.file_name}. Quality validation and AI specialty matching finished.",
        job_id
    )
    
    return {
        "job_id": job_id,
        "status": "Completed",
        "file_name": req.file_name,
        "row_count": len(raw_rows),
        "summary": processed["summary"],
        "warnings": processed["warnings"]
    }

# ── 4. DATA CLEANING & VALIDATION (Page 6) ─────────────────────
@app.get("/api/cleaning/summary")
def get_cleaning_summary():
    """Returns the 5 summary cards for Data Cleaning: Total, Complete, Missing, Invalid, Needs Review."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM providers")
    total = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM providers WHERE quality_status = 'Clean'")
    complete = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM cleaning_issues WHERE issue_type = 'missing' AND status = 'open'")
    missing = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM cleaning_issues WHERE issue_type = 'invalid_format' AND status = 'open'")
    invalid = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM cleaning_issues WHERE status = 'open'")
    needs_review = c.fetchone()[0]
    conn.close()
    
    return {
        "total_records": total,
        "complete_records": complete,
        "missing_information": missing,
        "invalid_formats": invalid,
        "needs_review": needs_review
    }

@app.get("/api/cleaning/issues")
def get_cleaning_issues(tab: str = "all", search: str = ""):
    conn = get_connection()
    c = conn.cursor()
    
    query = "SELECT * FROM cleaning_issues WHERE 1=1"
    params = []
    
    if tab == "missing":
        query += " AND issue_type = 'missing'"
    elif tab == "invalid_format":
        query += " AND issue_type = 'invalid_format'"
    elif tab == "duplicate_candidate":
        query += " AND issue_type = 'duplicate_candidate'"
    elif tab == "conflicting_value":
        query += " AND issue_type = 'conflicting_value'"
    elif tab == "needs_review":
        query += " AND (issue_type = 'needs_review' OR status = 'open')"
        
    if search:
        query += " AND (provider_name LIKE ? OR original_value LIKE ? OR issue_description LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
        
    query += " ORDER BY CASE WHEN status = 'open' THEN 0 ELSE 1 END, created_at DESC LIMIT 150"
    c.execute(query, params)
    issues = [dict(r) for r in c.fetchall()]
    conn.close()
    return issues

class SaveCorrectionRequest(BaseModel):
    corrected_value: str
    reason: str
    analyst_name: str = "Senior Analyst"

@app.post("/api/cleaning/issues/{issue_id}/correct")
def save_issue_correction(issue_id: str, req: SaveCorrectionRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM cleaning_issues WHERE id = ?", (issue_id,))
    issue = c.fetchone()
    if not issue:
        conn.close()
        raise HTTPException(status_code=404, detail="Issue not found")
        
    prov_id = issue["provider_id"]
    field = issue["field_name"]
    now_iso = datetime.utcnow().isoformat()
    
    c.execute("""
    UPDATE cleaning_issues
    SET status = 'corrected', suggested_value = ?, reviewed_at = ?, reviewed_by = ?
    WHERE id = ?
    """, (req.corrected_value, now_iso, req.analyst_name, issue_id))
    
    field_lower = field.lower()
    col_name = "accepted_doctor_name"
    if "specialty" in field_lower:
        col_name = "accepted_specialty"
    elif "clinic" in field_lower or "practice" in field_lower:
        col_name = "accepted_practice_name"
    elif "phone" in field_lower:
        col_name = "accepted_phone"
    elif "website" in field_lower:
        col_name = "accepted_website"
    elif "address" in field_lower or "location" in field_lower:
        col_name = "accepted_address"
        
    c.execute(f"SELECT history_json FROM providers WHERE id = ?", (prov_id,))
    prov = c.fetchone()
    history = []
    if prov and prov["history_json"]:
        try:
            history = json.loads(prov["history_json"])
        except Exception:
            history = []
    history.append({
        "timestamp": now_iso,
        "field": field,
        "original_value": issue["original_value"],
        "accepted_value": req.corrected_value,
        "reason": req.reason,
        "analyst": req.analyst_name
    })
    
    c.execute(f"""
    UPDATE providers
    SET {col_name} = ?, history_json = ?, verification_status = 'Accepted'
    WHERE id = ?
    """, (req.corrected_value, json.dumps(history), prov_id))
    
    conn.commit()
    conn.close()
    
    log_activity(
        "correction",
        f"Corrected {field} for {issue['provider_name']}",
        f"Updated value to '{req.corrected_value}'. Reason: {req.reason}",
        prov_id
    )
    return {"message": "Correction saved successfully", "issue_id": issue_id, "status": "corrected"}

@app.post("/api/cleaning/issues/{issue_id}/review")
def mark_issue_reviewed(issue_id: str, analyst_name: str = "Senior Analyst"):
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.utcnow().isoformat()
    c.execute("""
    UPDATE cleaning_issues
    SET status = 'reviewed', reviewed_at = ?, reviewed_by = ?
    WHERE id = ?
    """, (now_iso, analyst_name, issue_id))
    conn.commit()
    conn.close()
    return {"message": "Issue marked reviewed", "issue_id": issue_id, "status": "reviewed"}

@app.post("/api/cleaning/issues/{issue_id}/reset")
def reset_issue_to_proposed(issue_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM cleaning_issues WHERE id = ?", (issue_id,))
    issue = c.fetchone()
    if not issue:
        conn.close()
        raise HTTPException(status_code=404, detail="Issue not found")
        
    c.execute("""
    UPDATE cleaning_issues
    SET status = 'open', reviewed_at = NULL, reviewed_by = NULL
    WHERE id = ?
    """, (issue_id,))
    conn.commit()
    conn.close()
    return {"message": "Issue reset to original proposed state", "issue_id": issue_id}

# ── 5. AI CLASSIFICATION (Page 7) ──────────────────────────────
@app.get("/api/classification/summary")
def get_classification_summary():
    """Returns the 4 summary cards: Classified, High Confidence, Needs Review, Pending/Failed."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM providers WHERE ai_suggested_category != ''")
    classified = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM providers WHERE ai_confidence >= 0.88")
    high_conf = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM providers WHERE ai_status = 'Needs Review' OR (ai_confidence < 0.80 AND ai_suggested_category != '')")
    needs_review = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM providers WHERE ai_status = 'Pending' OR ai_suggested_category = ''")
    pending = c.fetchone()[0]
    conn.close()
    
    return {
        "classified": classified,
        "high_confidence": high_conf,
        "needs_review": needs_review,
        "pending_failed": pending
    }

@app.get("/api/classification/records")
def get_classification_records(status: str = "all", search: str = ""):
    conn = get_connection()
    c = conn.cursor()
    query = "SELECT id, accepted_doctor_name, collected_specialty, ai_suggested_category, ai_confidence, ai_explanation, ai_status FROM providers WHERE 1=1"
    params = []
    
    if status == "high_confidence":
        query += " AND ai_confidence >= 0.88"
    elif status == "needs_review":
        query += " AND (ai_status = 'Needs Review' OR ai_confidence < 0.80)"
    elif status == "pending":
        query += " AND (ai_status = 'Pending' OR ai_suggested_category = '')"
    elif status != "all":
        query += " AND ai_status = ?"
        params.append(status)
        
    if search:
        query += " AND (accepted_doctor_name LIKE ? OR collected_specialty LIKE ? OR ai_suggested_category LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
        
    query += " ORDER BY ai_confidence ASC LIMIT 150"
    c.execute(query, params)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

@app.get("/api/classification/taxonomy")
def get_specialty_taxonomy():
    return AGREED_TAXONOMY

@app.post("/api/classification/{provider_id}/approve")
def approve_classification(provider_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    UPDATE providers
    SET ai_status = 'Approved', accepted_specialty = ai_suggested_category
    WHERE id = ?
    """, (provider_id,))
    conn.commit()
    conn.close()
    return {"message": "Classification category approved", "provider_id": provider_id, "status": "Approved"}

class UpdateCategoryRequest(BaseModel):
    category: str
    notes: Optional[str] = "Analyst corrected taxonomy category"

@app.post("/api/classification/{provider_id}/update")
def update_classification_category(provider_id: str, req: UpdateCategoryRequest):
    if req.category not in AGREED_TAXONOMY:
        raise HTTPException(status_code=400, detail="Category not in agreed GP taxonomy")
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    UPDATE providers
    SET ai_suggested_category = ?, accepted_specialty = ?, ai_status = 'Corrected', ai_explanation = ?
    WHERE id = ?
    """, (req.category, req.category, f"Manually verified by analyst: {req.notes}", provider_id))
    conn.commit()
    conn.close()
    return {"message": "Specialty category updated", "provider_id": provider_id, "status": "Corrected"}

@app.post("/api/classification/retry-pending")
def retry_pending_classifications():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, collected_specialty FROM providers WHERE ai_status = 'Pending' OR ai_suggested_category = ''")
    pending_rows = c.fetchall()
    
    updated_count = 0
    from pipeline import classify_specialty_with_llm
    for r in pending_rows:
        res = classify_specialty_with_llm(r["collected_specialty"])
        c.execute("""
        UPDATE providers
        SET ai_suggested_category = ?, ai_confidence = ?, ai_explanation = ?, ai_status = ?
        WHERE id = ?
        """, (res["category"], res["confidence"], res["explanation"], res["status"], r["id"]))
        updated_count += 1
        
    conn.commit()
    conn.close()
    return {"message": f"Retried {updated_count} records", "updated_count": updated_count}

# ── 6. DATA EXPLORER (Page 8) ──────────────────────────────────
@app.get("/api/explorer")
def query_explorer_providers(
    search: str = "",
    specialty: str = "",
    suburb: str = "",
    quality: str = "",
    status: str = "",
    source: str = "",
    sort_by: str = "accepted_doctor_name",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 15
):
    conn = get_connection()
    c = conn.cursor()
    
    where_clauses = ["1=1"]
    params = []
    
    if search:
        s = f"%{search}%"
        where_clauses.append("(accepted_doctor_name LIKE ? OR accepted_practice_name LIKE ? OR suburb LIKE ? OR accepted_address LIKE ?)")
        params.extend([s, s, s, s])
    if specialty:
        where_clauses.append("(ai_suggested_category = ? OR collected_specialty = ?)")
        params.extend([specialty, specialty])
    if suburb:
        where_clauses.append("suburb = ?")
        params.append(suburb)
    if quality:
        where_clauses.append("quality_status = ?")
        params.append(quality)
    if status:
        where_clauses.append("verification_status = ?")
        params.append(status)
    if source:
        where_clauses.append("source_name = ?")
        params.append(source)
        
    where_sql = " AND ".join(where_clauses)
    
    c.execute(f"SELECT COUNT(*) FROM providers WHERE {where_sql}", params)
    total = c.fetchone()[0]
    
    allowed_cols = {
        "accepted_doctor_name": "accepted_doctor_name",
        "specialty": "ai_suggested_category",
        "practice": "accepted_practice_name",
        "suburb": "suburb",
        "quality_score": "quality_score",
        "collected_at": "collected_at"
    }
    col = allowed_cols.get(sort_by, "accepted_doctor_name")
    order = "ASC" if sort_order.lower() == "asc" else "DESC"
    
    offset = (page - 1) * page_size
    query = f"""
    SELECT * FROM providers
    WHERE {where_sql}
    ORDER BY {col} {order}
    LIMIT ? OFFSET ?
    """
    params.extend([page_size, offset])
    c.execute(query, params)
    records = [dict(r) for r in c.fetchall()]
    
    c.execute("SELECT DISTINCT suburb FROM providers WHERE suburb != '' ORDER BY suburb")
    suburbs = [r[0] for r in c.fetchall()]
    
    c.execute("SELECT DISTINCT ai_suggested_category FROM providers WHERE ai_suggested_category != '' ORDER BY ai_suggested_category")
    specialties = [r[0] for r in c.fetchall()]
    
    conn.close()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
        "records": records,
        "filter_options": {
            "suburbs": suburbs,
            "specialties": specialties,
            "qualities": ["Clean", "Minor Issues", "Action Required"],
            "verification_statuses": ["Collected", "Accepted", "Verified"],
            "sources": ["User Uploaded", "AHPRA Public Register"]
        }
    }

@app.get("/api/explorer/{provider_id}")
def get_provider_detail(provider_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM providers WHERE id = ?", (provider_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Provider not found")
        
    data = dict(row)
    for json_col in ["conflicts_json", "evidence_json", "history_json"]:
        if data.get(json_col):
            try:
                data[json_col.replace("_json", "")] = json.loads(data[json_col])
            except Exception:
                data[json_col.replace("_json", "")] = []
                
    c.execute("SELECT * FROM cleaning_issues WHERE provider_id = ?", (provider_id,))
    data["issues"] = [dict(iss) for iss in c.fetchall()]
    
    c.execute("""
    SELECT * FROM duplicate_candidates
    WHERE provider_a_id = ? OR provider_b_id = ?
    """, (provider_id, provider_id))
    data["duplicates"] = [dict(dup) for dup in c.fetchall()]
    
    conn.close()
    return data

class UpdateProviderFieldsRequest(BaseModel):
    accepted_doctor_name: Optional[str] = None
    accepted_practice_name: Optional[str] = None
    accepted_phone: Optional[str] = None
    accepted_website: Optional[str] = None
    accepted_address: Optional[str] = None
    suburb: Optional[str] = None
    analyst_notes: Optional[str] = "Manual update via Data Explorer"

@app.put("/api/explorer/{provider_id}")
def update_provider_fields(provider_id: str, req: UpdateProviderFieldsRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM providers WHERE id = ?", (provider_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Provider not found")
        
    now_iso = datetime.utcnow().isoformat()
    history = []
    if existing["history_json"]:
        try:
            history = json.loads(existing["history_json"])
        except Exception:
            history = []
            
    updates = []
    params = []
    for field, val in req.dict(exclude_unset=True).items():
        if field != "analyst_notes" and val is not None:
            updates.append(f"{field} = ?")
            params.append(val)
            history.append({
                "timestamp": now_iso,
                "field": field,
                "original_value": existing[field],
                "accepted_value": val,
                "actor": "Analyst Explorer Edit",
                "notes": req.analyst_notes
            })
            
    if updates:
        updates.append("history_json = ?")
        params.append(json.dumps(history))
        updates.append("verification_status = 'Accepted'")
        params.append(provider_id)
        c.execute(f"UPDATE providers SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
        
    conn.close()
    log_activity("edit", f"Edited {existing['accepted_doctor_name']}", req.analyst_notes or "Data Explorer update", provider_id)
    return {"message": "Provider record updated successfully", "provider_id": provider_id}

# ── 7. DUPLICATE CANDIDATES ────────────────────────────────────
@app.get("/api/duplicates")
def get_duplicate_candidates():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT d.*, 
           p1.accepted_phone as p1_phone, p1.accepted_practice_name as p1_clinic, p1.suburb as p1_suburb, p1.ai_suggested_category as p1_specialty,
           p2.accepted_phone as p2_phone, p2.accepted_practice_name as p2_clinic, p2.suburb as p2_suburb, p2.ai_suggested_category as p2_specialty
    FROM duplicate_candidates d
    LEFT JOIN providers p1 ON d.provider_a_id = p1.id
    LEFT JOIN providers p2 ON d.provider_b_id = p2.id
    ORDER BY d.similarity_score DESC
    """)
    rows = []
    for r in c.fetchall():
        d = dict(r)
        if d.get("match_reasons"):
            try:
                d["match_reasons"] = json.loads(d["match_reasons"])
            except Exception:
                pass
        rows.append(d)
    conn.close()
    return rows

class ResolveDuplicateRequest(BaseModel):
    action: str
    notes: Optional[str] = ""

@app.post("/api/duplicates/{pair_id}/resolve")
def resolve_duplicate_candidate(pair_id: str, req: ResolveDuplicateRequest):
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.utcnow().isoformat()
    status = "resolved_distinct" if req.action == "distinct" else "merged"
    
    c.execute("""
    UPDATE duplicate_candidates
    SET status = ?, resolved_at = ?, resolution_notes = ?
    WHERE id = ?
    """, (status, now_iso, req.notes, pair_id))
    
    c.execute("SELECT provider_a_id, provider_b_id FROM duplicate_candidates WHERE id = ?", (pair_id,))
    pair = c.fetchone()
    if pair:
        for pid in [pair["provider_a_id"], pair["provider_b_id"]]:
            c.execute("SELECT COUNT(*) FROM duplicate_candidates WHERE (provider_a_id = ? OR provider_b_id = ?) AND status = 'pending'", (pid, pid))
            remaining = c.fetchone()[0]
            if remaining == 0:
                c.execute("UPDATE providers SET has_duplicate_candidate = 0 WHERE id = ?", (pid,))
                
    conn.commit()
    conn.close()
    log_activity("duplicate_resolution", f"Resolved duplicate candidate pair #{pair_id[:6]}", f"Outcome: {status}. Notes: {req.notes}", pair_id)
    return {"message": "Duplicate candidate resolved", "pair_id": pair_id, "status": status}

# ── 8. ANALYTICS & REPORTS (Page 9) ────────────────────────────
@app.get("/api/reports/list")
def get_report_catalog():
    return [
        {
            "id": "cleaned_dataset",
            "title": "Cleaned Provider Dataset",
            "description": "Standardized practitioner roster with accepted doctor names, formatted telephone numbers, validated Sydney suburbs, and normalized clinic URLs.",
            "available_formats": ["xlsx", "csv"],
            "recommended_format": "xlsx",
            "coverage": "All 150 providers"
        },
        {
            "id": "quality_issues",
            "title": "Data Quality & Validation Issues",
            "description": "Comprehensive audit log of detected missing fields, non-standard phone numbers, missing websites, and practitioner review actions.",
            "available_formats": ["xlsx", "csv"],
            "recommended_format": "xlsx",
            "coverage": "Open & resolved validation issues"
        },
        {
            "id": "duplicate_candidates",
            "title": "Duplicate Candidates Report",
            "description": "Flagged practitioner pairs with string similarity percentages, identical clinic telephone numbers, match evidence, and human review status.",
            "available_formats": ["xlsx", "csv"],
            "recommended_format": "xlsx",
            "coverage": "All flagged duplicate pairs"
        },
        {
            "id": "ai_classifications",
            "title": "AI Specialty Classifications",
            "description": "Medical specialty categorization into agreed Australian GP taxonomy, model confidence scores (0-100%), and clinical reasoning explanations.",
            "available_formats": ["xlsx", "csv"],
            "recommended_format": "xlsx",
            "coverage": "All classified specialties"
        },
        {
            "id": "source_evidence",
            "title": "Source Evidence & Provenance Trail",
            "description": "Full audit log preserving original uploaded raw values, timestamps, source attribution (User Uploaded vs Public Register), and changes.",
            "available_formats": ["xlsx", "csv"],
            "recommended_format": "xlsx",
            "coverage": "Raw & accepted field comparison"
        }
    ]

@app.get("/api/export/{report_type}")
def download_report(report_type: str, format: str = Query("xlsx", regex="^(xlsx|csv)$")):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM providers ORDER BY accepted_doctor_name")
    providers = [dict(r) for r in c.fetchall()]
    
    c.execute("SELECT * FROM cleaning_issues ORDER BY created_at DESC")
    issues = [dict(r) for r in c.fetchall()]
    
    c.execute("SELECT * FROM duplicate_candidates ORDER BY similarity_score DESC")
    duplicates = [dict(r) for r in c.fetchall()]
    conn.close()
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M")
    
    if report_type == "cleaned_dataset":
        content = export_cleaned_dataset(providers, format)
        filename = f"caredata_cleaned_providers_{timestamp}.{format}"
    elif report_type == "quality_issues":
        content = export_quality_issues(issues, format)
        filename = f"caredata_quality_issues_{timestamp}.{format}"
    elif report_type == "duplicate_candidates":
        content = export_duplicate_candidates(duplicates, format)
        filename = f"caredata_duplicates_{timestamp}.{format}"
    elif report_type == "ai_classifications":
        content = export_ai_classifications(providers, format)
        filename = f"caredata_ai_classifications_{timestamp}.{format}"
    elif report_type == "source_evidence":
        content = export_source_evidence(providers, format)
        filename = f"caredata_source_evidence_{timestamp}.{format}"
    else:
        raise HTTPException(status_code=400, detail="Unknown report type")
        
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if format == "xlsx" else "text/csv"
    
    log_activity("export", f"Exported {report_type.replace('_', ' ').title()}", f"Generated {format.upper()} report file {filename}")
    
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ── 9. DATA COLLECTION (Page 10) ───────────────────────────────
@app.get("/api/collection/sources")
def get_collection_sources():
    return {
        "status": "ready_for_configuration",
        "notice": "Public source connectors are scheduled for Phase 2 implementation. The current active workflow operates on verified CSV/XLSX provider uploads.",
        "compliance_disclaimer": "All collection activities strictly respect Australian copyright, data sovereignty, robots.txt, and public access terms. CareData AI does NOT bypass credentials or perform unauthorized scraping.",
        "configured_sources": [
            {
                "id": "ahpra-reg",
                "name": "AHPRA Medical Practitioners Register",
                "website": "https://www.ahpra.gov.au",
                "type": "National Health Practitioner Statutory Register",
                "permitted_access": "Official Public Search API (Application Required)",
                "status": "Pending Permission Review",
                "record_count": 0,
                "last_collection": "Never"
            },
            {
                "id": "healthdirect-nhsd",
                "name": "Healthdirect National Health Services Directory (NHSD)",
                "website": "https://www.healthdirect.gov.au",
                "type": "Australian Government Health Directory",
                "permitted_access": "FHIR / HL7 Service Directory API",
                "status": "Pending Permission Review",
                "record_count": 0,
                "last_collection": "Never"
            }
        ],
        "collection_history": []
    }

# ── 10. SETTINGS (Page 11) ─────────────────────────────────────
@app.get("/api/settings")
def get_settings():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT value_json FROM settings WHERE key = 'app_config'")
    row = c.fetchone()
    conn.close()
    if not row:
        return {}
    data = json.loads(row[0])
    data["ai_security"] = {
        "groq_api_key_configured": bool(GROQ_API_KEY),
        "key_storage": "Server-side environment (.env) — Never exposed to browser"
    }
    return data

@app.post("/api/settings")
def save_settings(new_settings: Dict[str, Any]):
    new_settings.pop("ai_security", None)
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO settings (key, value_json) VALUES ('app_config', ?)", (json.dumps(new_settings),))
    
    # Synchronize default research location with projects table
    gen = new_settings.get("general", {})
    loc = gen.get("default_location")
    proj_id = gen.get("default_project", "sydney-gp-pilot")
    if loc is not None:
        c.execute("UPDATE projects SET research_location = ? WHERE id = ?", (str(loc).strip(), proj_id))
        
    conn.commit()
    conn.close()
    log_activity("settings", "Updated System Settings", f"Modified project defaults (Location: {loc})")
    return {"message": "Settings saved successfully"}

@app.post("/api/settings/reset")
def reset_settings_default():
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM settings WHERE key = 'app_config'")
    conn.commit()
    conn.close()
    init_db()
    return {"message": "Settings restored to system defaults"}
