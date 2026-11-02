from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    label: str
    value: str
    recommended: bool = False
    description: str = ""


class Question(BaseModel):
    id: str
    text: str
    category: str = "general"
    options: list[QuestionOption]


class Answer(BaseModel):
    question_id: str
    value: str
    label: str


class TechItem(BaseModel):
    id: str
    name: str
    category: str  # frontend | backend | language | database | ai_model | api | auth | deployment | dataset
    description: str = ""
    icon: str = "⚡"
    recommended: bool = False
    selected: bool = False
    tag: str = ""


class TechCategory(BaseModel):
    id: str
    name: str
    icon: str
    items: list[TechItem]


class StackChoice(BaseModel):
    ui: str = "nextjs"
    backend: str = "fastapi"
    llm: str = "groq"
    language: str = "python"
    database: str = "postgresql"


class DiagramData(BaseModel):
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []


class SetupStep(BaseModel):
    step: int
    title: str
    body: str = ""
    code: str = ""
    file: str = ""
    url: str = ""


class DatasetInfo(BaseModel):
    required: bool = False
    name: str = ""
    source: str = ""
    download_url: str = ""
    target_directory: str = "data/"
    instructions: str = ""
    sample_files: list[str] = []


class ApiKeyInfo(BaseModel):
    name: str
    env_var: str
    portal_url: str = ""
    description: str = ""
    is_required: bool = True


class FolderNode(BaseModel):
    name: str
    type: str  # "file" | "folder"
    path: str
    description: str = ""
    children: list["FolderNode"] = []


class BlueprintSpec(BaseModel):
    title: str = ""
    summary: str = ""
    domain: str = ""
    architecture_overview: str = ""
    key_features: list[str] = []
    dataset_info: DatasetInfo | None = None
    api_keys: list[ApiKeyInfo] = []
    folder_tree: list[dict[str, Any]] = []
    setup_commands: list[str] = []


class ProjectCreate(BaseModel):
    idea: str


class Project(BaseModel):
    id: str
    idea: str
    user_id: str | None = None
    status: str = "questioning"
    # questioning | tech_selection | architecture | blueprint_review | generating | done | error
    questions: list[Question] = []
    answers: list[Answer] = []
    current_question_index: int = 0
    technologies: list[dict[str, Any]] = []
    selected_technologies: list[str] = []
    stack: StackChoice | None = None
    blueprint_spec: BlueprintSpec | None = None
    diagrams: dict[str, DiagramData] = {
        "architecture": DiagramData(),
        "workflow": DiagramData(),
        "dataflow": DiagramData(),
    }
    setup_steps: list[SetupStep] = []
    files_zip_path: str | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
