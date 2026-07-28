"""Router exposing the orchestrator to NestJS's AI Gateway (see architecture
diagram: REST API + WebSocket Gateway -> AI Gateway -> Internal API -> here)."""

from fastapi import APIRouter, HTTPException
from app.schemas.common import OrchestrateRequest, OrchestrateResponse
from app.modules.orchestrator.graph import run_orchestration

router = APIRouter(prefix="/api/v1", tags=["orchestrator"])


@router.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate(payload: OrchestrateRequest):
    try:
        result = await run_orchestration(
            user_id=payload.user_id,
            message=payload.message,
            session_id=payload.session_id,
            context=payload.context,
        )
    except Exception as exc:  # noqa: BLE001 - surface as 500 to caller
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return OrchestrateResponse(
        intent=result.get("intent", "unknown"),
        mission_alignment=result.get("mission_alignment", {}),
        plan=result.get("plan", {}),
        domain_result=result.get("domain_result", {}),
        opportunities=result.get("opportunities", []),
        recommendations=result.get("recommendations", []),
        execution_guidance=result.get("execution_guidance", {}),
        memory_written=result.get("memory_written", False),
    )
