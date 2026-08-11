"""AI Life Planner — converts the goal into a concrete, ordered step plan.
Output feeds both the Domain Agent (for domain-specific enrichment) and
Execution Intelligence (for tracking)."""

import json
from app.core.llm import get_llm

SYSTEM_PROMPT = """You are the AI Life Planner of LifeKit. Given a user's goal
and domain, produce a concrete plan. Respond ONLY with JSON:
{"title": "<plan title>", "steps": [{"order": 1, "task": "...", "estimated_days": <int>}],
"total_estimated_days": <int>}"""


async def generate_plan(goal_summary: str, domain: str, mission_note: str) -> dict:
    llm = get_llm(temperature=0.4)
    prompt = (
        f"{SYSTEM_PROMPT}\n\nDomain: {domain}\nGoal: {goal_summary}\n"
        f"Mission context: {mission_note}"
    )
    # LLM/network errors propagate up instead of being swallowed here.
    response = await llm.ainvoke(prompt)
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {"title": goal_summary, "steps": [], "total_estimated_days": 0}


# ── Planner Actions (used by the standalone "AI Planner" page) ──────────
# Distinct from generate_plan() above: this powers the four action buttons
# (Generate/Optimise/Reduce/Accelerate) against an *existing* mission and
# returns a diff-style list of changes for the UI to render, instead of a
# fresh plan object.

ACTION_INSTRUCTIONS = {
    "generate": "Build a full execution plan from scratch for this mission, "
                "as a list of concrete added tasks.",
    "optimise": "Rebalance the timeline and workload so deadlines are realistic "
                "without burning the user out. Prefer 'changed' entries (timeline/hours).",
    "reduce": "Cut non-essential tasks to the minimum needed to reach the goal. "
              "Prefer 'removed' entries.",
    "accelerate": "Restructure the plan to hit the goal on an earlier target date. "
                  "Prefer 'changed' entries that pull dates in and increase weekly hours.",
}

ACTION_SYSTEM_PROMPT = """You are the AI Life Planner of LifeKit, proposing a revision
to a user's existing mission plan. Respond ONLY with JSON in this exact shape:
{"changes": [
  {"type": "added" | "changed" | "removed", "description": "<one concrete, specific line>",
   "field": "task" | "timeline" | "hours", "before": "<optional>", "after": "<optional>"}
]}
Return 3 to 6 concrete, specific changes. No commentary outside the JSON."""


async def generate_plan_action(
    action: str,
    mission_title: str,
    mission_goal: str,
    progress: int = 0,
    domain: str = "general",
) -> list[dict]:
    instruction = ACTION_INSTRUCTIONS.get(action, ACTION_INSTRUCTIONS["generate"])
    llm = get_llm(temperature=0.4)
    prompt = (
        f"{ACTION_SYSTEM_PROMPT}\n\nAction requested: {action} — {instruction}\n"
        f"Mission: {mission_title}\nGoal: {mission_goal}\n"
        f"Current progress: {progress}%\nDomain: {domain}"
    )
    # LLM/network errors propagate up (see router) instead of being swallowed.
    response = await llm.ainvoke(prompt)
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        data = json.loads(raw)
        return data.get("changes", [])
    except (json.JSONDecodeError, TypeError):
        return []