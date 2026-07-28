"""
LifeKit AI Service

FastAPI application for AI orchestration.
Handles intent understanding, planning, recommendations,
memory management, and other AI-powered features.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

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


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "lifekit-ai-service",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root():
    return {
        "name": "LifeKit AI Service",
        "version": "0.1.0",
        "docs": "/docs",
    }

