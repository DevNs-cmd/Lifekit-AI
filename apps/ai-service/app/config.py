"""Application configuration using pydantic-settings."""

import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service
    service_port: int = 8000
    internal_api_key: str = "lifekit-internal-secret-change-in-production"

    # Database
    database_url: str = "postgresql://lifekit:lifekit@localhost:5432/lifekit"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Qdrant
    qdrant_url: str = "http://localhost:6333"

    # OpenAI / LLM
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    # Fallback LLM Config
    fallback_api_key: str = ""
    fallback_api_base: str = "https://api.openai.com/v1"
    fallback_model: str = "gpt-4o"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:4000"]

    model_config = {
        "env_prefix": "ai_service_",
        "case_sensitive": False,
        "env_file": [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")),
            ".env"
        ],
        "extra": "ignore",
    }


settings = Settings()