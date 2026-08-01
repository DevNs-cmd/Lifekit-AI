"""Shared base for all domain agents. Each agent takes the plan + goal and
adds domain-specific enrichment (advice, risks, resources)."""

import json
from abc import ABC, abstractmethod
from app.core.llm import get_llm


class DomainAgent(ABC):
    domain: str
    expertise_prompt: str

    async def run(self, goal_summary: str, plan: dict) -> dict:
        llm = get_llm(temperature=0.4)
        system = (
            f"You are the {self.domain.title()} Domain Agent of LifeKit. {self.expertise_prompt}\n"
            'Respond ONLY with JSON: {"advice": "...", "risks": ["..."], "resources": ["..."]}'
        )
        prompt = f"{system}\n\nGoal: {goal_summary}\nPlan: {json.dumps(plan)}"
        response = await llm.ainvoke(prompt)
        try:
            result = json.loads(response.content)
        except (json.JSONDecodeError, TypeError):
            result = {"advice": "", "risks": [], "resources": []}
        result["domain"] = self.domain
        return result
