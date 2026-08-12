from __future__ import annotations
"""Life Mission Engine — checks how the current goal fits the user's broader
life mission (stored in context/memory) and flags misalignment early."""

import json
from app.core.llm import get_llm

SYSTEM_PROMPT = """You are the Life Mission Engine of LifeKit. Given the user's
stated life mission (may be empty) and their current goal, respond ONLY with JSON:
{"aligned": <bool>, "alignment_score": <0-1 float>, "note": "<one sentence>"}"""


async def align_with_mission(goal_summary: str, life_mission: str | None) -> dict:
    if not life_mission:
        # No life mission on file — nothing to check alignment against.
        # Return a neutral default instead of spending an LLM call to say
        # essentially "can't evaluate, no mission set".
        return {
            "aligned": True,
            "alignment_score": 1.0,
            "note": "No life mission set yet.",
        }

    llm = get_llm(temperature=0.2)
    prompt = (
        f"{SYSTEM_PROMPT}\n\nLife mission: {life_mission}\n"
        f"Current goal: {goal_summary}"
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
        return {"aligned": True, "alignment_score": 0.5, "note": "Could not evaluate alignment."}