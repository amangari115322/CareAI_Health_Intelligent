"""
Projects router — Core API endpoints for the AI Project Builder Platform.
Handles idea analysis, guided requirements, technology stack selection,
dynamic architecture diagrams, blueprint preview, and project ZIP generation.
"""

import os
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.orm.attributes import flag_modified

from database import get_session
from db_models import ProjectRow
from models.project import Project, ProjectCreate, Answer, StackChoice, DiagramData
from agents.question_agent import run_question_agent
from agents.tech_recommender import recommend_tech_stack
from agents.blueprint_agent import run_blueprint_agent
from agents.setup_agent import build_blueprint_spec, generate_setup_steps
from agents.codegen_agent import run_codegen_agent

router = APIRouter(prefix="/api", tags=["projects"])


class AnswerRequest(BaseModel):
    project_id: str
    question_id: str
    value: str
    label: str


class TechAnalysisRequest(BaseModel):
    project_id: str


class TechUpdateRequest(BaseModel):
    project_id: str
    selected_technologies: list[str]


class GenerateRequest(BaseModel):
    project_id: str


class StackRequest(BaseModel):
    project_id: str
    ui: str = "nextjs"
    llm: str = "groq"


# ─── Helper: row → dict for API responses ────────────────────────────────────

def _row_to_dict(row: ProjectRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "idea": row.idea,
        "user_id": row.user_id,
        "status": row.status,
        "questions": row.questions or [],
        "answers": row.answers or [],
        "current_question_index": row.current_question_index,
        "technologies": row.technologies or [],
        "blueprint_spec": row.blueprint_spec,
        "recommended_stack": row.recommended_stack,
        "stack": row.stack,
        "diagrams": row.diagrams or {},
        "setup_steps": row.setup_steps or [],
        "files_zip_path": row.files_zip_path,
        "error": row.error,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


# ─── 1. POST /api/analyze ────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_idea(body: ProjectCreate):
    """Start project from an idea. Generates guided requirement questions."""
    project_id = str(uuid.uuid4())
    questions = await run_question_agent(body.idea)
    questions_data = [q.model_dump() for q in questions]

    async with get_session() as session:
        row = ProjectRow(
            id=project_id,
            idea=body.idea,
            questions=questions_data,
            answers=[],
            current_question_index=0,
            status="questioning",
            technologies=[],
            diagrams={},
            setup_steps=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(row)

    return {
        "project_id": project_id,
        "questions": questions_data,
        "status": "questioning",
    }


# ─── 2. POST /api/answer ─────────────────────────────────────────────────────

@router.post("/answer")
async def submit_answer(body: AnswerRequest):
    """Submit an answer to a guided question; returns next index or tech_selection status."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        answer = Answer(
            question_id=body.question_id,
            value=body.value,
            label=body.label,
        )

        answers_so_far = list(row.answers or [])
        answers_so_far.append(answer.model_dump())

        current_idx = (row.current_question_index or 0) + 1
        questions = row.questions or []
        all_done = current_idx >= len(questions)

        row.answers = answers_so_far
        row.current_question_index = current_idx
        row.updated_at = datetime.utcnow()

        if all_done:
            row.status = "tech_selection"

        flag_modified(row, "answers")

    if all_done:
        return {
            "done": True,
            "status": "tech_selection",
        }

    return {
        "done": False,
        "next_question_index": current_idx,
    }


# ─── 3. POST /api/analyze-tech ───────────────────────────────────────────────

@router.post("/analyze-tech")
async def analyze_technologies(body: TechAnalysisRequest):
    """Analyzes requirements and returns categorized technology recommendations & initial diagrams."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        answers = [Answer(**a) for a in (row.answers or [])]
        idea = row.idea

    # 1. Recommend Tech Stack Categories
    categories = await recommend_tech_stack(idea, answers)
    categories_data = [cat.model_dump() for cat in categories]

    # Gather initially selected technologies
    selected_techs = []
    for cat in categories:
        for item in cat.items:
            if item.selected:
                selected_techs.append(item.name)

    # 2. Generate Domain-Specific Diagrams
    diagrams = await run_blueprint_agent(idea, answers, selected_techs)
    diagrams_data = {k: v.model_dump() for k, v in diagrams.items()}

    # 3. Build Blueprint Specification & Setup Steps
    blueprint_spec = build_blueprint_spec(idea, answers, selected_techs)
    blueprint_data = blueprint_spec.model_dump()
    setup_steps = generate_setup_steps(idea, answers, selected_techs)
    setup_data = [s.model_dump() for s in setup_steps]

    # Save state
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if row:
            row.technologies = categories_data
            row.diagrams = diagrams_data
            row.blueprint_spec = blueprint_data
            row.setup_steps = setup_data
            row.status = "tech_selection"
            row.updated_at = datetime.utcnow()
            flag_modified(row, "technologies")
            flag_modified(row, "diagrams")
            flag_modified(row, "blueprint_spec")
            flag_modified(row, "setup_steps")

    return {
        "categories": categories_data,
        "selected_technologies": selected_techs,
        "diagrams": diagrams_data,
        "blueprint_spec": blueprint_data,
        "setup_steps": setup_data,
    }


# ─── 4. POST /api/update-tech ───────────────────────────────────────────────

@router.post("/update-tech")
async def update_technologies(body: TechUpdateRequest):
    """User changes/toggles selected technologies; dynamically updates diagrams and blueprint."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        answers = [Answer(**a) for a in (row.answers or [])]
        idea = row.idea
        categories_data = list(row.technologies or [])

        # Update selected status in categories_data
        selected_set = set(t.lower() for t in body.selected_technologies)
        for cat in categories_data:
            for item in cat.get("items", []):
                item["selected"] = (item["name"].lower() in selected_set or item["id"].lower() in selected_set)

    # Recompute diagrams and blueprint
    diagrams = await run_blueprint_agent(idea, answers, body.selected_technologies)
    diagrams_data = {k: v.model_dump() for k, v in diagrams.items()}
    blueprint_spec = build_blueprint_spec(idea, answers, body.selected_technologies)
    blueprint_data = blueprint_spec.model_dump()
    setup_steps = generate_setup_steps(idea, answers, body.selected_technologies)
    setup_data = [s.model_dump() for s in setup_steps]

    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if row:
            row.technologies = categories_data
            row.diagrams = diagrams_data
            row.blueprint_spec = blueprint_data
            row.setup_steps = setup_data
            row.updated_at = datetime.utcnow()
            flag_modified(row, "technologies")
            flag_modified(row, "diagrams")
            flag_modified(row, "blueprint_spec")
            flag_modified(row, "setup_steps")

    return {
        "diagrams": diagrams_data,
        "blueprint_spec": blueprint_data,
        "setup_steps": setup_data,
    }


# ─── 5. POST /api/generate ──────────────────────────────────────────────────

@router.post("/generate")
async def generate_project(body: GenerateRequest, background_tasks: BackgroundTasks):
    """Generates the actual project source code, configurations, and working ZIP."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == body.project_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        row.status = "generating"
        row.updated_at = datetime.utcnow()

        project_obj = Project(
            id=row.id,
            idea=row.idea,
            user_id=row.user_id,
            status="generating",
            questions=[q if isinstance(q, dict) else q.model_dump() for q in (row.questions or [])],
            answers=[Answer(**a) for a in (row.answers or [])],
            technologies=row.technologies or [],
            diagrams={k: DiagramData(**v) for k, v in (row.diagrams or {}).items()},
            setup_steps=row.setup_steps or [],
        )

    # Run code generation
    try:
        zip_path = await run_codegen_agent(project_obj)
        async with get_session() as session:
            result = await session.execute(
                select(ProjectRow).where(ProjectRow.id == body.project_id)
            )
            row = result.scalar_one_or_none()
            if row:
                row.files_zip_path = zip_path
                row.status = "done"
                row.updated_at = datetime.utcnow()

        return {
            "status": "done",
            "zip_path": zip_path,
            "download_url": f"/api/project/{body.project_id}/download",
        }
    except Exception as e:
        async with get_session() as session:
            result = await session.execute(
                select(ProjectRow).where(ProjectRow.id == body.project_id)
            )
            row = result.scalar_one_or_none()
            if row:
                row.status = "error"
                row.error = str(e)
        raise HTTPException(status_code=500, detail=f"Code generation failed: {e}")


# ─── 6. POST /api/stack (Legacy compatibility) ──────────────────────────────

@router.post("/stack")
async def submit_stack(body: StackRequest, background_tasks: BackgroundTasks):
    """Backward-compatible endpoint for legacy triggers."""
    return await generate_project(GenerateRequest(project_id=body.project_id), background_tasks)


# ─── 7. GET /api/project/{id} ───────────────────────────────────────────────

@router.get("/project/{project_id}")
async def get_project(project_id: str):
    """Get full project state."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == project_id)
        )
        row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    return _row_to_dict(row)


# ─── 8. GET /api/projects ───────────────────────────────────────────────────

@router.get("/projects")
async def list_projects(user_id: str | None = None, limit: int = 20):
    """List recent projects."""
    async with get_session() as session:
        query = select(ProjectRow).order_by(desc(ProjectRow.created_at)).limit(limit)
        if user_id:
            query = query.where(ProjectRow.user_id == user_id)
        result = await session.execute(query)
        rows = result.scalars().all()

    return {"projects": [_row_to_dict(r) for r in rows]}


# ─── 9. GET /api/project/{id}/download ──────────────────────────────────────

@router.get("/project/{project_id}/download")
async def download_project(project_id: str):
    """Reliably stream the generated project as a ZIP download."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == project_id)
        )
        row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    zip_path = row.files_zip_path

    # If file does not exist on disk, generate it dynamically so user NEVER gets an error!
    if not zip_path or not os.path.exists(zip_path):
        project_obj = Project(
            id=row.id,
            idea=row.idea,
            user_id=row.user_id,
            status=row.status,
            questions=[q if isinstance(q, dict) else q.model_dump() for q in (row.questions or [])],
            answers=[Answer(**a) for a in (row.answers or [])],
            technologies=row.technologies or [],
            diagrams={k: DiagramData(**v) for k, v in (row.diagrams or {}).items()},
            setup_steps=row.setup_steps or [],
        )
        zip_path = await run_codegen_agent(project_obj)
        async with get_session() as session:
            result = await session.execute(
                select(ProjectRow).where(ProjectRow.id == project_id)
            )
            r = result.scalar_one_or_none()
            if r:
                r.files_zip_path = zip_path
                r.status = "done"

    filename = f"blueprintai-{project_id[:8]}.zip"
    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


# ─── 10. DELETE /api/project/{id} ───────────────────────────────────────────

@router.delete("/project/{project_id}")
async def delete_project(project_id: str):
    """Delete a project by ID."""
    async with get_session() as session:
        result = await session.execute(
            select(ProjectRow).where(ProjectRow.id == project_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")

        if row.files_zip_path and os.path.exists(row.files_zip_path):
            try:
                os.remove(row.files_zip_path)
            except Exception:
                pass

        await session.delete(row)

    return {"success": True, "deleted_id": project_id}

