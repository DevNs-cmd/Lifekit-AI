"""Recommendation Engine — takes domain result + opportunities + relevant
memory and produces the final personalized, ranked recommendation list
shown to the user."""

import json
from app.core.llm import get_llm


async def build_recommendations(
    domain_result: dict, opportunities: list[dict], relevant_memory: list[dict]
) -> list[dict]:
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
    try:
        parsed = json.loads(response.content)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []
