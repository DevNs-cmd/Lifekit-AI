from __future__ import annotations

"""The Orchestrator — a LangGraph StateGraph wiring every AI module
into a single pipeline, matching the architecture diagram:

memory_read -> intent -> mission -> planner -> domain_agent
            -> opportunity -> recommendation -> execution -> memory_write

Every node catches ALL exceptions so a single LLM/network failure
never crashes the entire graph — the pipeline always completes and
returns whatever partial results were gathered.
"""

import logging
from functools import lru_cache
from langgraph.graph import StateGraph, END

from app.modules.orchestrator.state import AgentState
from app.modules.memory.service import retrieve_relevant_memory, store_memory
from app.modules.intent.service import understand_intent
from app.modules.mission.service import align_with_mission
from app.modules.planner.service import generate_plan
from app.modules.domain_agents.agents import get_agent
from app.modules.opportunity.service import discover_opportunities
from app.modules.recommendation.service import build_recommendations
from app.modules.execution.service import guide_execution

logger = logging.getLogger(__name__)


async def node_memory_read(state: AgentState) -> AgentState:
    try:
        relevant = await retrieve_relevant_memory(state["user_id"], state["message"])
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_memory_read failed (non-fatal): %s", exc)
        relevant = []
    return {"relevant_memory": relevant}


async def node_intent(state: AgentState) -> AgentState:
    try:
        result = await understand_intent(state["message"], state.get("relevant_memory", []))
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_intent failed (non-fatal): %s", exc)
        result = {
            "intent": "general_help",
            "domain": "general",
            "confidence": 0.0,
            "goal_summary": state["message"],
        }
    return {
        "intent": result.get("intent", "unknown"),
        "intent_confidence": result.get("confidence", 0.0),
        "domain": result.get("domain", "general"),
        "context": {
            **state.get("context", {}),
            "goal_summary": result.get("goal_summary", state["message"]),
        },
    }


async def node_mission(state: AgentState) -> AgentState:
    try:
        goal_summary = state["context"].get("goal_summary", state["message"])
        life_mission = state["context"].get("life_mission")
        result = await align_with_mission(goal_summary, life_mission)
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_mission failed (non-fatal): %s", exc)
        result = {"aligned": True, "alignment_score": 0.5, "note": ""}
    return {"mission_alignment": result}


async def node_planner(state: AgentState) -> AgentState:
    try:
        goal_summary = state["context"].get("goal_summary", state["message"])
        mission_note = state.get("mission_alignment", {}).get("note", "")
        plan = await generate_plan(goal_summary, state.get("domain", "general"), mission_note)
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_planner failed (non-fatal): %s", exc)
        plan = {"title": state["message"], "steps": [], "total_estimated_days": 0}
    return {"plan": plan}


async def node_domain_agent(state: AgentState) -> AgentState:
    try:
        goal_summary = state["context"].get("goal_summary", state["message"])
        agent = get_agent(state.get("domain", "general"))
        result = await agent.run(goal_summary, state.get("plan", {}))
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_domain_agent failed (non-fatal): %s", exc)
        result = {
            "advice": (
                "I'm here to help with your goals! To get started, tell me more about "
                "what you'd like to achieve and I'll guide you step by step."
            ),
            "risks": [],
            "resources": [],
            "domain": state.get("domain", "general"),
        }
    return {"domain_result": result}


async def node_opportunity(state: AgentState) -> AgentState:
    try:
        goal_summary = state["context"].get("goal_summary", state["message"])
        opportunities = await discover_opportunities(state.get("domain", "general"), goal_summary)
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_opportunity failed (non-fatal): %s", exc)
        opportunities = []
    return {"opportunities": opportunities}


async def node_recommendation(state: AgentState) -> AgentState:
    try:
        recs = await build_recommendations(
            state.get("domain_result", {}),
            state.get("opportunities", []),
            state.get("relevant_memory", []),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_recommendation failed (non-fatal): %s", exc)
        recs = []
    return {"recommendations": recs}


async def node_execution(state: AgentState) -> AgentState:
    try:
        guidance = await guide_execution(state.get("plan", {}), state.get("recommendations", []))
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_execution failed (non-fatal): %s", exc)
        guidance = {"next_action": "", "check_in_frequency_days": 3, "motivation_note": ""}
    return {"execution_guidance": guidance}


async def node_memory_write(state: AgentState) -> AgentState:
    try:
        summary = (
            f"Goal: {state['context'].get('goal_summary', state['message'])} | "
            f"Domain: {state.get('domain')} | "
            f"Plan: {state.get('plan', {}).get('title', '')} | "
            f"Next action: {state.get('execution_guidance', {}).get('next_action', '')}"
        )
        written = await store_memory(
            state["user_id"], summary, {"session_id": state.get("session_id", "")}
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_memory_write failed (non-fatal): %s", exc)
        written = False
    return {"memory_written": written}


@lru_cache
def build_orchestrator_graph():
    graph = StateGraph(AgentState)

    graph.add_node("memory_read",   node_memory_read)
    graph.add_node("intent",        node_intent)
    graph.add_node("mission",       node_mission)
    graph.add_node("planner",       node_planner)
    graph.add_node("domain_agent",  node_domain_agent)
    graph.add_node("opportunity",   node_opportunity)
    graph.add_node("recommendation",node_recommendation)
    graph.add_node("execution",     node_execution)
    graph.add_node("memory_write",  node_memory_write)

    graph.set_entry_point("memory_read")
    graph.add_edge("memory_read",    "intent")
    graph.add_edge("intent",         "mission")
    graph.add_edge("mission",        "planner")
    graph.add_edge("planner",        "domain_agent")
    graph.add_edge("domain_agent",   "opportunity")
    graph.add_edge("opportunity",    "recommendation")
    graph.add_edge("recommendation", "execution")
    graph.add_edge("execution",      "memory_write")
    graph.add_edge("memory_write",   END)

    return graph.compile()


async def run_orchestration(
    user_id: str, message: str, session_id: str | None, context: dict
) -> AgentState:
    app_graph = build_orchestrator_graph()
    initial_state: AgentState = {
        "user_id": user_id,
        "session_id": session_id or "",
        "message": message,
        "context": context or {},
    }
    return await app_graph.ainvoke(initial_state)
