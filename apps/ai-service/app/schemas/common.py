"""Shared request/response contracts between NestJS <-> ai-service."""

from pydantic import BaseModel, Field
from typing import Optional, Any


class OrchestrateRequest(BaseModel):
    """What NestJS sends to POST /api/v1/orchestrate."""
    user_id: str
    message: str
    session_id: Optional[str] = None
    context: dict[str, Any] = Field(default_factory=dict)


class OrchestrateResponse(BaseModel):
    """What ai-service returns to NestJS after running the full graph."""
    intent: str
    mission_alignment: dict[str, Any]
    plan: dict[str, Any]
    domain_result: dict[str, Any]
    opportunities: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    execution_guidance: dict[str, Any]
    memory_written: bool
