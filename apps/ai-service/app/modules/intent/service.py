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
    response = await llm.ainvoke(prompt)
    try:
        parsed = json.loads(response.content)
    except (json.JSONDecodeError, TypeError):
        parsed = {"intent": "unknown", "domain": "general", "confidence": 0.0, "goal_summary": message}
    return parsed
