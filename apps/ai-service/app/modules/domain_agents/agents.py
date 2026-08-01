"""Concrete domain agents and the registry used by the orchestrator to
pick the right one based on the domain classified by Intent Understanding."""

from app.modules.domain_agents.base import DomainAgent


class CareerAgent(DomainAgent):
    domain = "career"
    expertise_prompt = "You specialize in career growth, skills, job search, and promotions."


class FinanceAgent(DomainAgent):
    domain = "finance"
    expertise_prompt = "You specialize in personal finance, budgeting, saving, and investing basics."


class HealthAgent(DomainAgent):
    domain = "health"
    expertise_prompt = "You specialize in fitness, nutrition, and sustainable health habits."


class TravelAgent(DomainAgent):
    domain = "travel"
    expertise_prompt = "You specialize in trip planning, budgets, and itineraries."


class BusinessAgent(DomainAgent):
    domain = "business"
    expertise_prompt = "You specialize in starting/growing a small business or side project."


class GeneralAgent(DomainAgent):
    domain = "general"
    expertise_prompt = "You give balanced, practical general life advice."


AGENT_REGISTRY: dict[str, DomainAgent] = {
    "career": CareerAgent(),
    "finance": FinanceAgent(),
    "health": HealthAgent(),
    "travel": TravelAgent(),
    "business": BusinessAgent(),
    "general": GeneralAgent(),
}


def get_agent(domain: str) -> DomainAgent:
    return AGENT_REGISTRY.get(domain, AGENT_REGISTRY["general"])
