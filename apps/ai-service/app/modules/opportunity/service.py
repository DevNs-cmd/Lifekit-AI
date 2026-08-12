"""Opportunity Discovery — surfaces concrete opportunities (courses, gigs,
grants, communities) relevant to the user's domain + plan."""

import json
from app.core.llm import get_llm


async def discover_opportunities(domain: str, goal_summary: str) -> list[dict]:
    llm = get_llm(temperature=0.5)
    prompt = (
        f'List 3 realistic opportunities (e.g. courses, communities, resources, '
        f'programs) relevant to this {domain} goal: "{goal_summary}". '
        'Respond ONLY with a JSON array: '
        '[{"title": "...", "type": "...", "why_relevant": "..."}]'
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
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []