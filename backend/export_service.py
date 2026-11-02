"""
CareData AI - Export Service
Generates professional CSV and Excel (.xlsx) reports for:
1. Cleaned Provider Dataset
2. Data Quality Issues
3. Duplicate Candidates
4. AI Specialty Classifications
5. Source Evidence & Audit Trail
"""

import io
import csv
from datetime import datetime
from typing import List, Dict, Any
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Forest Green Theme Palette
HEADER_FILL = PatternFill(start_color="1B4332", end_color="1B4332", fill_type="solid")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
ZEBRA_FILL = PatternFill(start_color="F8FAF9", end_color="F8FAF9", fill_type="solid")
THIN_BORDER = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)

def create_styled_excel(sheet_title: str, headers: List[str], rows: List[List[Any]]) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_title[:31]
    
    # Title / Metadata Banner
    ws.append([f"CareData AI — {sheet_title}"])
    ws.cell(row=1, column=1).font = Font(name="Calibri", size=14, bold=True, color="1B4332")
    ws.append([f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Scope: Sydney GP Research Pilot | Disclaimer: Research data only, not patient care."])
    ws.cell(row=2, column=1).font = Font(name="Calibri", size=9, italic=True, color="64748B")
    ws.append([]) # Empty spacer
    
    # Headers
    header_row_idx = 4
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=header_row_idx, column=col_idx)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cell.border = THIN_BORDER
        
    # Data Rows
    current_row = header_row_idx + 1
    for r in rows:
        ws.append(r)
        is_even = (current_row % 2 == 0)
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=current_row, column=col_idx)
            cell.font = Font(name="Calibri", size=10)
            cell.border = THIN_BORDER
            if is_even:
                cell.fill = ZEBRA_FILL
        current_row += 1
        
    # Auto adjust column widths
    for col in ws.columns:
        if col[0].row < header_row_idx:
            continue
        max_len = 0
        for cell in col:
            if cell.row >= header_row_idx and cell.value:
                val_len = len(str(cell.value))
                if val_len > max_len:
                    max_len = val_len
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 48)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()

def create_csv_bytes(headers: List[str], rows: List[List[Any]]) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for r in rows:
        writer.writerow([str(c) if c is not None else "" for c in r])
    return output.getvalue().encode('utf-8')

def export_cleaned_dataset(records: List[Dict[str, Any]], format_type: str = "xlsx") -> bytes:
    headers = [
        "Record ID", "Doctor Name", "AI Specialty Category", "Original Specialty",
        "Practice Name", "Address", "Suburb", "State", "Postcode",
        "Phone", "Website", "Quality Score", "Quality Status", "Verification Status", "Source"
    ]
    rows = []
    for r in records:
        rows.append([
            r.get("id", ""),
            r.get("accepted_doctor_name", ""),
            r.get("ai_suggested_category", ""),
            r.get("collected_specialty", ""),
            r.get("accepted_practice_name", ""),
            r.get("accepted_address", ""),
            r.get("suburb", ""),
            r.get("state", "NSW"),
            r.get("postcode", ""),
            r.get("accepted_phone", ""),
            r.get("accepted_website", ""),
            f"{r.get('quality_score', 0)}%",
            r.get("quality_status", "Clean"),
            r.get("verification_status", "Accepted"),
            r.get("source_name", "User Uploaded")
        ])
    if format_type == "csv":
        return create_csv_bytes(headers, rows)
    return create_styled_excel("Cleaned Provider Dataset", headers, rows)

def export_quality_issues(issues: List[Dict[str, Any]], format_type: str = "xlsx") -> bytes:
    headers = [
        "Issue ID", "Provider Name", "Field", "Issue Type",
        "Original Value", "Suggested Value", "Issue Description",
        "Suggested Action", "Status", "Reported At"
    ]
    rows = []
    for iss in issues:
        rows.append([
            iss.get("id", ""),
            iss.get("provider_name", ""),
            iss.get("field_name", ""),
            iss.get("issue_type", "").replace("_", " ").title(),
            iss.get("original_value", ""),
            iss.get("suggested_value", ""),
            iss.get("issue_description", ""),
            iss.get("suggested_action", ""),
            iss.get("status", "open").title(),
            iss.get("created_at", "")[:19]
        ])
    if format_type == "csv":
        return create_csv_bytes(headers, rows)
    return create_styled_excel("Data Quality & Cleaning Issues", headers, rows)

def export_duplicate_candidates(duplicates: List[Dict[str, Any]], format_type: str = "xlsx") -> bytes:
    headers = [
        "Candidate Pair ID", "Provider A Name", "Provider B Name",
        "Similarity Score", "Match Reasons", "Resolution Status", "Created At"
    ]
    rows = []
    for dup in duplicates:
        reasons = dup.get("match_reasons", "[]")
        if isinstance(reasons, str) and reasons.startswith("["):
            import json
            try:
                reasons = "; ".join(json.loads(reasons))
            except Exception:
                pass
        rows.append([
            dup.get("id", ""),
            dup.get("provider_a_name", ""),
            dup.get("provider_b_name", ""),
            f"{int(float(dup.get('similarity_score', 0)) * 100)}%",
            reasons,
            dup.get("status", "pending").replace("_", " ").title(),
            dup.get("created_at", "")[:19]
        ])
    if format_type == "csv":
        return create_csv_bytes(headers, rows)
    return create_styled_excel("Duplicate Candidates Report", headers, rows)

def export_ai_classifications(records: List[Dict[str, Any]], format_type: str = "xlsx") -> bytes:
    headers = [
        "Provider ID", "Doctor Name", "Source Specialty Text",
        "AI Suggested Category", "Model Confidence", "Clinical Reasoning", "Review Status"
    ]
    rows = []
    for r in records:
        conf = r.get("ai_confidence", 0.0)
        rows.append([
            r.get("id", ""),
            r.get("accepted_doctor_name", ""),
            r.get("collected_specialty", ""),
            r.get("ai_suggested_category", "General Practice / Family Medicine"),
            f"{int(float(conf) * 100)}%",
            r.get("ai_explanation", ""),
            r.get("ai_status", "AI Suggested")
        ])
    if format_type == "csv":
        return create_csv_bytes(headers, rows)
    return create_styled_excel("AI Specialty Classifications", headers, rows)

def export_source_evidence(records: List[Dict[str, Any]], format_type: str = "xlsx") -> bytes:
    headers = [
        "Record ID", "Doctor Name", "Raw Name", "Accepted Phone", "Raw Phone",
        "Practice Name", "Source Name", "Source URL", "Collection Timestamp", "Verification Level"
    ]
    rows = []
    for r in records:
        rows.append([
            r.get("id", ""),
            r.get("accepted_doctor_name", ""),
            r.get("collected_doctor_name", ""),
            r.get("accepted_phone", ""),
            r.get("collected_phone", ""),
            r.get("accepted_practice_name", ""),
            r.get("source_name", "User Uploaded"),
            r.get("source_url", "N/A"),
            r.get("collected_at", "")[:19],
            r.get("verification_status", "Accepted")
        ])
    if format_type == "csv":
        return create_csv_bytes(headers, rows)
    return create_styled_excel("Source Evidence & Provenance Trail", headers, rows)
