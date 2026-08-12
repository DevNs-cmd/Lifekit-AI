"""Casual Reply — single-call short-circuit for chitchat (greetings, thanks,
small talk). Skips mission/planner/domain_agent/opportunity/recommendation/
execution entirely so a "hey" doesn't burn 6+ LLM calls or come back as a
fake 'plan for how to greet someone'."""

from app.core.llm import get_llm

SYSTEM_PROMPT = (
    "You are LifeKit's AI Coach. The user sent a casual message (greeting, "
    "thanks, small talk) with no concrete goal to plan. Reply naturally and "
    "briefly, like a real conversation opener — 1-3 sentences. "
    "Do NOT produce a plan, numbered steps, or the word 'Plan:'. "
    "Do NOT invent a task related to the act of greeting itself."
)


async def casual_reply(message: str) -> str:
    llm = get_llm(temperature=0.5)
    response = await llm.ainvoke(f"{SYSTEM_PROMPT}\n\nUser message: {message}")
    return response.content.strip()