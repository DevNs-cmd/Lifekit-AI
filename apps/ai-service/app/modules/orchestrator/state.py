"""AgentState: the single object every LangGraph node reads from and writes to."""

from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    # input
    user_id: str
    session_id: str
    message: str
    context: dict[str, Any]

    # populated by memory node (read at start)
    relevant_memory: list[dict[str, Any]]

    # populated by each node in sequence
    intent: str
    intent_confidence: float
    mission_alignment: dict[str, Any]
    plan: dict[str, Any]
    domain: str
    domain_result: dict[str, Any]
    opportunities: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    execution_guidance: dict[str, Any]

    # populated by memory node (write at end)
    memory_written: bool
