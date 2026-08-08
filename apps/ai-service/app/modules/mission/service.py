from __future__ import annotations
"""Life Mission Engine — checks how the current goal fits the user's broader
life mission (stored in context/memory) and flags misalignment early."""

import json
import logging
from app.core.llm import get_llm

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Life Mission Engine of LifeKit. Given the user's
stated life mission (may be empty) and their current goal, respond ONLY with JSON:
{"aligned": <bool>, "alignment_score": <0-1 float>, "note": "<one sentence>"}"""


async def align_with_mission(goal_summary: str, life_mission: str | None) -> dict:
    try:
        llm = get_llm(temperature=0.2)
        prompt = (
            f"{SYSTEM_PROMPT}\n\nLife mission: {life_mission or 'Not set yet'}\n"
            f"Current goal: {goal_summary}"
        )
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        pass
    except Exception as exc:  # noqa: BLE001 — LLM/network errors
        logger.warning("align_with_mission LLM call failed: %s", exc)

    return {"aligned": True, "alignment_score": 0.5, "note": "Could not evaluate alignment."}
