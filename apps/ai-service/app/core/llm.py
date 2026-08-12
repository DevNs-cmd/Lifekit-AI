"""Single shared LLM client. All modules call get_llm() instead of
instantiating ChatOpenAI directly, so provider/model can be swapped in one place.
"""

from functools import lru_cache
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel
from app.config import settings


class LLMNotConfiguredError(RuntimeError):
    """Raised when no OpenAI API key is configured for the AI service."""


@lru_cache
def get_llm(temperature: float = 0.3) -> BaseChatModel:
    if not settings.openai_api_key:
        # Failing fast here with a clear message (instead of silently using a
        # "placeholder-key") means the chatbot surfaces "AI service is not
        # configured" instead of an opaque OpenAI 401 several calls deep in
        # the orchestration graph.
        raise LLMNotConfiguredError(
            "AI_SERVICE_OPENAI_API_KEY is not set. Configure it in the "
            "ai-service environment before the chatbot can respond."
        )

    primary_llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_api_base,
        temperature=temperature,
        metadata={"role": "primary"},
        # Every orchestrator node's output is short JSON/1-3 sentences —
        # capping tokens and retries cuts per-call latency across the
        # 4-7 LLM calls a single chat message can trigger.
        max_tokens=400,
        max_retries=1,
        timeout=20,
    )

    fallback_api_key = settings.fallback_api_key or settings.openai_api_key
    fallback_llm = ChatOpenAI(
        model=settings.fallback_model,
        api_key=fallback_api_key,
        base_url=settings.fallback_api_base,
        temperature=temperature,
        metadata={"role": "fallback"},
        max_tokens=400,
        max_retries=1,
        timeout=20,
    )

    # Wrap primary LLM with fallback mechanism
    return primary_llm.with_fallbacks([fallback_llm])
