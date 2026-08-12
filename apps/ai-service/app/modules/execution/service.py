"""Execution Intelligence — last AI reasoning node. Turns the plan +
recommendations into an immediate next action + check-in cadence."""

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
        return {"next_action": "", "check_in_frequency_days": 3, "motivation_note": ""}