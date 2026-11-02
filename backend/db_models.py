"""
db_models.py — SQLAlchemy ORM table definitions for PostgreSQL.

Replaces the MongoDB collections:
  - users      (was: users_col)
  - projects   (was: projects_col)
  - messages   (was: messages_col)

All nested JSON data (questions, answers, diagrams, setup_steps, stack, etc.)
is stored as PostgreSQL JSONB columns so the same Python dict structures
used by the Pydantic models are persisted without any schema flattening.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class UserRow(Base):
    """Corresponds to the former MongoDB 'users' collection."""

    __tablename__ = "users"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, default="")
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship
    projects = relationship("ProjectRow", back_populates="user", lazy="select")


class ProjectRow(Base):
    """Corresponds to the former MongoDB 'projects' collection.

    All nested Pydantic data is stored as JSONB:
      - questions      → list[Question]
      - answers        → list[Answer]
      - diagrams       → dict[str, DiagramData]
      - setup_steps    → list[SetupStep]
      - stack          → StackChoice | None
      - recommended_stack → dict | None
    """

    __tablename__ = "projects"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    idea = Column(Text, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="questioning")

    # JSONB columns — store Pydantic model dicts directly
    questions = Column(JSONB, nullable=False, default=list)
    answers = Column(JSONB, nullable=False, default=list)
    current_question_index = Column(Integer, nullable=False, default=0)
    recommended_stack = Column(JSONB, nullable=True)
    stack = Column(JSONB, nullable=True)
    technologies = Column(JSONB, nullable=False, default=list)
    blueprint_spec = Column(JSONB, nullable=True)
    diagrams = Column(JSONB, nullable=False, default=dict)
    setup_steps = Column(JSONB, nullable=False, default=list)

    files_zip_path = Column(String(500), nullable=True)
    error = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship
    user = relationship("UserRow", back_populates="projects")
    messages = relationship("MessageRow", back_populates="project", lazy="select")


class MessageRow(Base):
    """Corresponds to the former MongoDB 'messages' collection."""

    __tablename__ = "messages"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    project_id = Column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship
    project = relationship("ProjectRow", back_populates="messages")
