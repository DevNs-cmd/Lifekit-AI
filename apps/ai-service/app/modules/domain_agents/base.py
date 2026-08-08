"""Shared base for all domain agents. Each agent takes the plan + goal and
adds domain-specific enrichment (advice, risks, resources)."""

import json
import logging
from app.core.llm import get_llm

logger = logging.getLogger(__name__)

# Shown when the LLM is unavailable — gives users a real response
# instead of a blank/error message.
FALLBACK_ADVICE = (
    "I'm your AI Life Coach and I'm ready to help you reach your goals. "
    "To give you personalised guidance, share more about what you want to achieve — "
    "whether it's career growth, financial independence, better health, or something else. "
    "I'll help you break it into a clear action plan."
)


class DomainAgent:
    domain: str = "general"
    expertise_prompt: str = "You give balanced, practical general life advice."

    async def run(self, goal_summary: str, plan: dict) -> dict:
        try:
            llm = get_llm(temperature=0.4)
            system = (
                f"You are the {self.domain.title()} Domain Agent of LifeKit. "
                f"{self.expertise_prompt}\n"
                'Respond ONLY with JSON: {"advice": "...", "risks": ["..."], "resources": ["..."]}'
            )
            prompt = f"{system}\n\nGoal: {goal_summary}\nPlan: {json.dumps(plan)}"
            response = await llm.ainvoke(prompt)
            raw = response.content.strip()
            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()
            result = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            result = {"advice": FALLBACK_ADVICE, "risks": [], "resources": []}
        except Exception as exc:  # noqa: BLE001 — LLM/network errors
            logger.warning("DomainAgent(%s).run failed: %s", self.domain, exc)
            result = {"advice": FALLBACK_ADVICE, "risks": [], "resources": []}

        result["domain"] = self.domain
        return result
