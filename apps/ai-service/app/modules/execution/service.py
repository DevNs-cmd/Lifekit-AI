"""Execution Intelligence — last AI reasoning node. Turns the plan +
recommendations into an immediate next action + check-in cadence."""

import json
import logging
from app.core.llm import get_llm

logger = logging.getLogger(__name__)


async def guide_execution(plan: dict, recommendations: list[dict]) -> dict:
    try:
        llm = get_llm(temperature=0.3)
        prompt = (
            "You are Execution Intelligence for LifeKit. Given this plan and "
            "recommendations, respond ONLY with JSON: "
            '{"next_action": "...", "check_in_frequency_days": <int>, "motivation_note": "..."}\n\n'
            f"Plan: {json.dumps(plan)}\nRecommendations: {json.dumps(recommendations)}"
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
        logger.warning("guide_execution LLM call failed: %s", exc)

    return {"next_action": "", "check_in_frequency_days": 3, "motivation_note": ""}
