from __future__ import annotations

"""The Orchestrator — a LangGraph StateGraph wiring every AI module
into a single pipeline, matching the architecture diagram:

memory_read -> intent -> [casual_reply | fanout_full -> {mission -> planner
            -> domain_agent, opportunity} -> recommendation -> execution]
            -> memory_write

Chitchat (greetings/thanks/small talk, no concrete goal) routes straight to
casual_reply — one LLM call, no fabricated plan — instead of the full
goal-planning pipeline.

For real goals, opportunity only needs domain + goal_summary (both already
set by intent), so it runs in parallel with mission -> planner ->
domain_agent instead of waiting behind them; recommendation joins on both
branches. mission itself is skipped (no LLM call) when the user has no
life_mission set (see mission/service.py).

The memory read/write nodes are side-effects and stay non-fatal (a
memory hiccup shouldn't block a reply). The LLM-reasoning nodes
(intent/mission/planner/domain_agent/opportunity/recommendation/
execution) do NOT swallow errors — a real LLM/network failure (e.g.
missing API key) propagates up to run_orchestration -> the FastAPI
router, which turns it into a proper error response, instead of
silently returning the same generic canned reply every time.
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
from app.modules.casual.service import casual_reply

logger = logging.getLogger(__name__)


async def node_memory_read(state: AgentState) -> AgentState:
    try:
        relevant = await retrieve_relevant_memory(state["user_id"], state["message"])
    except Exception as exc:  # noqa: BLE001
        logger.warning("node_memory_read failed (non-fatal): %s", exc)
        relevant = []
    return {"relevant_memory": relevant}


async def node_intent(state: AgentState) -> AgentState:
    result = await understand_intent(state["message"], state.get("relevant_memory", []))
    return {
        "intent": result.get("intent", "unknown"),
        "intent_confidence": result.get("confidence", 0.0),
        "domain": result.get("domain", "general"),
        "context": {
            **state.get("context", {}),
            "goal_summary": result.get("goal_summary", state["message"]),
        },
    }


async def node_casual_reply(state: AgentState) -> AgentState:
    """Short-circuit for chitchat (greetings, thanks, small talk) — one LLM
    call instead of the 6+ calls the full goal-planning pipeline makes, and
    a natural reply instead of a fabricated 'plan for how to greet'."""
    reply = await casual_reply(state["message"])
    return {"domain_result": {"advice": reply, "risks": [], "resources": []}}


def route_after_intent(state: AgentState) -> str:
    return "casual" if state.get("intent") == "chitchat" else "full"


async def node_fanout_full(state: AgentState) -> AgentState:
    """No-op pass-through so 'mission' and 'opportunity' can both start
    right after intent, in parallel, instead of opportunity waiting behind
    mission -> planner -> domain_agent."""
    return {}


async def node_mission(state: AgentState) -> AgentState:
    goal_summary = state["context"].get("goal_summary", state["message"])
    life_mission = state["context"].get("life_mission")
    result = await align_with_mission(goal_summary, life_mission)
    return {"mission_alignment": result}


async def node_planner(state: AgentState) -> AgentState:
    goal_summary = state["context"].get("goal_summary", state["message"])
    mission_note = state.get("mission_alignment", {}).get("note", "")
    plan = await generate_plan(goal_summary, state.get("domain", "general"), mission_note)
    return {"plan": plan}


async def node_domain_agent(state: AgentState) -> AgentState:
    goal_summary = state["context"].get("goal_summary", state["message"])
    agent = get_agent(state.get("domain", "general"))
    result = await agent.run(goal_summary, state.get("plan", {}))
    return {"domain_result": result}


async def node_opportunity(state: AgentState) -> AgentState:
    goal_summary = state["context"].get("goal_summary", state["message"])
    opportunities = await discover_opportunities(state.get("domain", "general"), goal_summary)
    return {"opportunities": opportunities}


async def node_recommendation(state: AgentState) -> AgentState:
    recs = await build_recommendations(
        state.get("domain_result", {}),
        state.get("opportunities", []),
        state.get("relevant_memory", []),
    )
    return {"recommendations": recs}


async def node_execution(state: AgentState) -> AgentState:
    guidance = await guide_execution(state.get("plan", {}), state.get("recommendations", []))
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
    graph.add_node("casual_reply",  node_casual_reply)
    graph.add_node("fanout_full",   node_fanout_full)
    graph.add_node("mission",       node_mission)
    graph.add_node("planner",       node_planner)
    graph.add_node("domain_agent",  node_domain_agent)
    graph.add_node("opportunity",   node_opportunity)
    graph.add_node("recommendation",node_recommendation)
    graph.add_node("execution",     node_execution)
    graph.add_node("memory_write",  node_memory_write)

    graph.set_entry_point("memory_read")
    graph.add_edge("memory_read",    "intent")
    graph.add_conditional_edges(
        "intent",
        route_after_intent,
        {"casual": "casual_reply", "full": "fanout_full"},
    )
    graph.add_edge("casual_reply",   "memory_write")
    # opportunity only needs domain + goal_summary (both set by intent), so
    # it runs concurrently with mission -> planner -> domain_agent instead
    # of waiting behind them. recommendation joins on both branches.
    graph.add_edge("fanout_full",    "mission")
    graph.add_edge("fanout_full",    "opportunity")
    graph.add_edge("mission",        "planner")
    graph.add_edge("planner",        "domain_agent")
    graph.add_edge("domain_agent",   "recommendation")
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