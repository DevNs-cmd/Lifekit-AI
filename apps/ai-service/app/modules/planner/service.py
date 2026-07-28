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
    response = await llm.ainvoke(prompt)
    try:
        return json.loads(response.content)
    except (json.JSONDecodeError, TypeError):
        return {"title": goal_summary, "steps": [], "total_estimated_days": 0}
