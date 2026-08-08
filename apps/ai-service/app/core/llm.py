"""Single shared LLM client. All modules call get_llm() instead of
instantiating ChatOpenAI directly, so provider/model can be swapped in one place.
"""

from functools import lru_cache
from langchain_openai import ChatOpenAI
from app.config import settings


class LLMNotConfiguredError(RuntimeError):
    """Raised when no OpenAI API key is configured for the AI service."""


@lru_cache
def get_llm(temperature: float = 0.3) -> ChatOpenAI:
    if not settings.openai_api_key:
        # Failing fast here with a clear message (instead of silently using a
        # "placeholder-key") means the chatbot surfaces "AI service is not
        # configured" instead of an opaque OpenAI 401 several calls deep in
        # the orchestration graph.
        raise LLMNotConfiguredError(
            "AI_SERVICE_OPENAI_API_KEY is not set. Configure it in the "
            "ai-service environment before the chatbot can respond."
        )
    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_api_base,
        temperature=temperature,
    )
