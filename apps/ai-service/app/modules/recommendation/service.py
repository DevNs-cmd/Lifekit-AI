"""Recommendation Engine — takes domain result + opportunities + relevant
memory and produces the final personalized, ranked recommendation list
shown to the user."""

import json
import logging
from app.core.llm import get_llm

logger = logging.getLogger(__name__)


async def build_recommendations(
    domain_result: dict, opportunities: list[dict], relevant_memory: list[dict]
) -> list[dict]:
    try:
        llm = get_llm(temperature=0.4)
        memory_snippet = "\n".join(m.get("text", "") for m in relevant_memory[:5])
        prompt = (
            "You are the Recommendation Engine of LifeKit. Personalize and rank the "
            "options below using the user's memory/history. Respond ONLY with a JSON "
            'array: [{"title": "...", "reason": "...", "priority": <1-5 int>}]\n\n'
            f"Domain advice: {domain_result.get('advice', '')}\n"
            f"Opportunities: {json.dumps(opportunities)}\n"
            f"User history/memory:\n{memory_snippet}"
        )
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        pass
    except Exception as exc:  # noqa: BLE001 — LLM/network errors
        logger.warning("build_recommendations LLM call failed: %s", exc)

    return []
