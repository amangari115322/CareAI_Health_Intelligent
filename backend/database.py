"""
database.py — PostgreSQL async database engine, session factory, and table init.

Replaces the previous Motor (MongoDB) async client.

Usage in routers:
    from database import get_session
    async with get_session() as session:
        ...

Tables are auto-created on startup via init_db() called from main.py lifespan.
"""

from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import settings
from db_models import Base

# ── Engine & session factory ──────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    echo=False,           # set True to log SQL for debugging
    pool_pre_ping=True,   # drop stale connections automatically
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Session context manager (for use in routers / background tasks) ───────────

@asynccontextmanager
async def get_session() -> AsyncSession:
    """Yield an async SQLAlchemy session with automatic commit/rollback."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


from sqlalchemy import text

# ── Table creation on startup ─────────────────────────────────────────────────

async def init_db():
    """Create all tables if they don't exist yet and ensure required columns are present."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Idempotent column migrations for projects table
        await conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;"))
        await conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS blueprint_spec JSONB;"))
    print("[OK] PostgreSQL connected — tables & columns verified")


async def close_db():
    """Dispose the async engine connection pool on shutdown."""
    await engine.dispose()
    print("PostgreSQL connection pool closed")
