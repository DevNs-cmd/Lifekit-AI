"""Opportunity Discovery — surfaces concrete opportunities (courses, gigs,
grants, communities) relevant to the user's domain + plan.

NOTE: today this uses the LLM's own knowledge as a placeholder for real
external data. Once External Data APIs (see architecture diagram) are wired
up in apps/api, replace `_llm_suggest` calls here with actual API results
passed in, and keep this module purely for ranking/filtering."""

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
    response = await llm.ainvoke(prompt)
    try:
        parsed = json.loads(response.content)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []
