"""Intent Understanding — first node after memory retrieval.
Classifies the raw user message into an intent label + target life domain."""

import json
from app.core.llm import get_llm

DOMAINS = ["career", "finance", "health", "travel", "business", "general"]

SYSTEM_PROMPT = """You are the Intent Understanding module of LifeKit, an AI life-goal
execution platform. Given a user's message and relevant memory, classify it.

Respond ONLY with JSON: {{"intent": "<short_intent_label>", "domain": "<one of: %s>",
"confidence": <0-1 float>, "goal_summary": "<one sentence>"}}""" % ", ".join(DOMAINS)


async def understand_intent(message: str, relevant_memory: list[dict]) -> dict:
    llm = get_llm(temperature=0.1)
    memory_snippet = "\n".join(m.get("text", "") for m in relevant_memory[:5])
    prompt = f"{SYSTEM_PROMPT}\n\nRelevant memory:\n{memory_snippet}\n\nUser message:\n{message}"
    # LLM/network errors propagate up instead of being swallowed here.
    response = await llm.ainvoke(prompt)
    raw = response.content.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {
            "intent": "general_help",
            "domain": "general",
            "confidence": 0.0,
            "goal_summary": message,
        }