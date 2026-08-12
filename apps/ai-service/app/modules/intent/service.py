"""Intent Understanding — first node after memory retrieval.
Classifies the raw user message into an intent label + target life domain."""

import json
from app.core.llm import get_llm

DOMAINS = ["career", "finance", "health", "travel", "business", "general"]

# Messages classified as "chitchat" skip the full goal-planning pipeline
# (mission/planner/domain_agent/opportunity/recommendation/execution) —
# see graph.py's conditional routing after this node.
SYSTEM_PROMPT = """You are the Intent Understanding module of LifeKit, an AI life-goal
execution platform. Given a user's message and relevant memory, classify it.

If the message is a greeting, small talk, thanks, or has no concrete goal to plan
(e.g. "hey", "hi", "thanks", "how are you", "who are you"), set intent to
"chitchat" and domain to "general" — do NOT invent a goal or plan for it.

Respond ONLY with JSON: {{"intent": "<short_intent_label, or \\"chitchat\\">",
"domain": "<one of: %s>", "confidence": <0-1 float>,
"goal_summary": "<one sentence, or the raw message if chitchat>"}}""" % ", ".join(DOMAINS)


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