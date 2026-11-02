"""
CareData AI - Database Storage Engine
Uses standard library sqlite3 for zero-dependency, reliable local persistence.
Stores providers, cleaning issues, duplicate candidates, jobs, and settings.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "caredata.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Projects table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        research_location TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # 2. Providers table (preserving collected vs accepted vs verified)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS providers (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        
        -- Doctor identity
        collected_doctor_name TEXT,
        accepted_doctor_name TEXT,
        
        -- Specialty
        collected_specialty TEXT,
        accepted_specialty TEXT,
        ai_suggested_category TEXT,
        ai_confidence REAL,
        ai_explanation TEXT,
        ai_status TEXT, -- 'AI Suggested', 'Approved', 'Corrected', 'Needs Review', 'Pending'
        
        -- Practice and Location
        collected_practice_name TEXT,
        accepted_practice_name TEXT,
        collected_address TEXT,
        accepted_address TEXT,
        suburb TEXT,
        state TEXT,
        postcode TEXT,
        
        -- Contact
        collected_phone TEXT,
        accepted_phone TEXT,
        collected_website TEXT,
        accepted_website TEXT,
        
        -- Provenance & Evidence
        source_name TEXT,
        source_url TEXT,
        collected_at TEXT,
        
        -- Statuses
        quality_score INTEGER,
        quality_status TEXT, -- 'Clean', 'Minor Issues', 'Action Required'
        verification_status TEXT, -- 'Collected', 'Accepted', 'Verified'
        has_duplicate_candidate INTEGER DEFAULT 0,
        needs_review INTEGER DEFAULT 0,
        
        -- JSON fields
        conflicts_json TEXT DEFAULT '[]',
        evidence_json TEXT DEFAULT '{}',
        history_json TEXT DEFAULT '[]'
    )
    """)
    
    # 3. Data Cleaning Issues table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cleaning_issues (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        provider_name TEXT,
        field_name TEXT NOT NULL,
        original_value TEXT,
        suggested_value TEXT,
        issue_type TEXT, -- 'missing', 'invalid_format', 'duplicate_candidate', 'conflicting_value', 'needs_review'
        issue_description TEXT,
        suggested_action TEXT,
        status TEXT, -- 'open', 'reviewed', 'corrected', 'dismissed'
        created_at TEXT,
        reviewed_at TEXT,
        reviewed_by TEXT,
        evidence TEXT,
        change_history TEXT DEFAULT '[]'
    )
    """)
    
    # 4. Duplicate Candidates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS duplicate_candidates (
        id TEXT PRIMARY KEY,
        provider_a_id TEXT NOT NULL,
        provider_b_id TEXT NOT NULL,
        provider_a_name TEXT,
        provider_b_name TEXT,
        similarity_score REAL,
        match_reasons TEXT, -- JSON array of strings
        status TEXT, -- 'pending', 'resolved_distinct', 'merged'
        created_at TEXT,
        resolved_at TEXT,
        resolution_notes TEXT
    )
    """)
    
    # 5. Background / Pipeline Jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        file_name TEXT,
        row_count INTEGER,
        current_stage TEXT, -- 'Data Cleaning', 'Duplicate Detection', 'AI Classification', 'Data Validation', 'Save Results', 'Completed'
        stage_index INTEGER, -- 1 to 5
        status TEXT, -- 'Running', 'Completed', 'Completed with warnings', 'Failed'
        progress REAL, -- 0 to 100
        counts_json TEXT,
        warnings_json TEXT,
        start_time TEXT,
        end_time TEXT
    )
    """)
    
    # 6. Activity log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        action_type TEXT,
        title TEXT,
        description TEXT,
        target_id TEXT,
        created_at TEXT
    )
    """)
    
    # 7. Application settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT
    )
    """)
    
    conn.commit()
    
    # Check default project
    cursor.execute("SELECT id FROM projects WHERE id = 'sydney-gp-pilot'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO projects (id, name, description, research_location, created_at)
        VALUES ('sydney-gp-pilot', 'Sydney GP Research Pilot', 'Pilot study covering 150 General Practitioners across Greater Sydney.', 'Sydney, Australia', ?)
        """, (datetime.utcnow().isoformat(),))
        
        # Default settings
        default_taxonomy = [
            "General Practice / Family Medicine",
            "Women's Health & Antenatal Care",
            "Skin Cancer Medicine",
            "Paediatrics & Child Health",
            "Chronic Disease Management",
            "Mental Health",
            "Occupational & Corporate Health",
            "Sports Medicine & Musculoskeletal",
            "Geriatric & Aged Care",
            "Travel Medicine & Preventive Care",
            "Undetermined / Unspecified"
        ]
        
        default_settings = {
            "general": {
                "default_project": "sydney-gp-pilot",
                "default_location": "Sydney, Australia",
                "analyst_name": "Senior Medical Data Analyst"
            },
            "taxonomy": default_taxonomy,
            "quality_rules": {
                "require_doctor_name": True,
                "require_specialty": True,
                "require_phone": True,
                "require_address": True,
                "require_website": False,
                "validate_au_phone_format": True,
                "flag_missing_website": True
            },
            "review_preferences": {
                "auto_approve_ai_threshold": 0.88,
                "duplicate_similarity_threshold": 0.80,
                "freshness_threshold_days": 90
            },
            "appearance": {
                "theme": "dark",
                "density": "balanced"
            },
            "ai": {
                "provider": "Groq Llama 3.3 / Qwen 27B",
                "model": "qwen/qwen3.8-27b",
                "fallback_enabled": True
            }
        }
        
        cursor.execute("INSERT OR REPLACE INTO settings (key, value_json) VALUES ('app_config', ?)", (json.dumps(default_settings),))
        conn.commit()

    conn.close()

init_db()
