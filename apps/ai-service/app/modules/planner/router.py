"""Standalone Planner Action endpoint — powers the "AI Planner" page's
Generate/Optimise/Reduce/Accelerate buttons directly against a mission,
without going through the full chat orchestrator pipeline."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.modules.planner.service import generate_plan_action

router = APIRouter(prefix="/api/v1/planner", tags=["planner"])


class PlannerActionRequest(BaseModel):
    action: str  # generate | optimise | reduce | accelerate
    mission_title: str
    mission_goal: str
    progress: int = 0
    domain: str = "general"


class PlanChange(BaseModel):
    type: str
    description: str
    field: str
    before: Optional[str] = None
    after: Optional[str] = None


class PlannerActionResponse(BaseModel):
    changes: List[PlanChange]


@router.post("/action", response_model=PlannerActionResponse)
async def planner_action(payload: PlannerActionRequest):
    if payload.action not in {"generate", "optimise", "reduce", "accelerate"}:
        raise HTTPException(status_code=400, detail=f"Unknown action: {payload.action}")
    try:
        changes = await generate_plan_action(
            action=payload.action,
            mission_title=payload.mission_title,
            mission_goal=payload.mission_goal,
            progress=payload.progress,
            domain=payload.domain,
        )
    except Exception as exc:  # noqa: BLE001 — surface real LLM/network errors, don't swallow
        raise HTTPException(status_code=502, detail=f"Planner action failed: {exc}") from exc
    return {"changes": changes}
