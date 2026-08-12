"""Single shared LLM client. All modules call get_llm() instead of
instantiating ChatOpenAI directly, so provider/model can be swapped in one place."""

from functools import lru_cache
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel
from app.config import settings


@lru_cache
def get_llm(temperature: float = 0.3) -> BaseChatModel:
    primary_llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key or "placeholder-key",
        base_url=settings.openai_api_base,
        temperature=temperature,
        metadata={"role": "primary"},
    )

    fallback_api_key = settings.fallback_api_key or settings.openai_api_key or "placeholder-key"
    fallback_llm = ChatOpenAI(
        model=settings.fallback_model,
        api_key=fallback_api_key,
        base_url=settings.fallback_api_base,
        temperature=temperature,
        metadata={"role": "fallback"},
    )

    # Wrap primary LLM with fallback mechanism
    return primary_llm.with_fallbacks([fallback_llm])

