from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/blueprintai"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # LLM providers
    groq_api_key: str = "GROQ_API_KEY"
    gemini_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Auth
    secret_key: str = "change-me-in-production-please"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # App
    environment: str = "development"
    allowed_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
