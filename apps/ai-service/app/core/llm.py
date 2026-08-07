"""Single shared LLM client. All modules call get_llm() instead of
instantiating ChatOpenAI directly, so provider/model can be swapped in one place."""

from functools import lru_cache
from langchain_openai import ChatOpenAI
from app.config import settings


@lru_cache
def get_llm(temperature: float = 0.3) -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key or "placeholder-key",
        base_url=settings.openai_api_base,
        temperature=temperature,
    )
