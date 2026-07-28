"""Execution Intelligence — last AI reasoning node. Turns the plan +
recommendations into an immediate next action + check-in cadence, and is
also the module the background Worker calls on a schedule to nudge
progress (via apps/worker -> Redis -> this same endpoint)."""

import json
from app.core.llm import get_llm


async def guide_execution(plan: dict, recommendations: list[dict]) -> dict:
    llm = get_llm(temperature=0.3)
    prompt = (
        "You are Execution Intelligence for LifeKit. Given this plan and "
        "recommendations, respond ONLY with JSON: "
        '{"next_action": "...", "check_in_frequency_days": <int>, "motivation_note": "..."}\n\n'
        f"Plan: {json.dumps(plan)}\nRecommendations: {json.dumps(recommendations)}"
    )
    response = await llm.ainvoke(prompt)
    try:
        return json.loads(response.content)
    except (json.JSONDecodeError, TypeError):
        return {"next_action": "", "check_in_frequency_days": 3, "motivation_note": ""}
