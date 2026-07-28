"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service
    service_port: int = 8000

    # Database
    database_url: str = "postgresql://lifekit:lifekit@localhost:5432/lifekit"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Qdrant
    qdrant_url: str = "http://localhost:6333"

    # OpenAI / LLM
    openai_api_key: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:4000"]

    model_config = {
        "env_prefix": "ai_service_",
        "case_sensitive": False,
        "env_file": "../../.env",
    }


settings = Settings()

