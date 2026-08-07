"""
LifeKit AI Service

FastAPI application for AI orchestration.
Handles intent understanding, planning, recommendations,
memory management, and other AI-powered features.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.modules.orchestrator.router import router as orchestrator_router
from app.modules.memory.router import router as memory_router
from app.modules.recommendation.router import router as recommendations_router

app = FastAPI(
    title="LifeKit AI Service",
    description="AI orchestration layer for LifeKit platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orchestrator_router)
app.include_router(memory_router)
app.include_router(recommendations_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "lifekit-ai-service",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to inspect loaded settings."""
    from app.config import settings
    return {
        "openai_api_base": settings.openai_api_base,
        "openai_model": settings.openai_model,
        "openai_embedding_model": settings.openai_embedding_model,
        "key_prefix": settings.openai_api_key[:20] if settings.openai_api_key else "(empty)",
    }


@app.get("/")
async def root():
    return {
        "name": "LifeKit AI Service",
        "version": "0.1.0",
        "docs": "/docs",
    }

