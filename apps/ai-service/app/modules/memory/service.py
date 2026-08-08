from __future__ import annotations
"""Life Memory — long-term semantic memory per user, backed by Qdrant.
Read once at the start of orchestration (relevant context), written once
at the end (what happened + what was decided)."""

import time
import uuid
import logging
from openai import AsyncOpenAI
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue
from app.config import settings
from app.core.vector_store import get_qdrant, MEMORY_COLLECTION

logger = logging.getLogger(__name__)


def get_openai_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openai_api_key or "placeholder-key",
        base_url=settings.openai_api_base,
    )


async def _embed(text: str) -> list[float]:
    client = get_openai_client()
    resp = await client.embeddings.create(model=settings.openai_embedding_model, input=text)
    return resp.data[0].embedding


async def retrieve_relevant_memory(user_id: str, query: str, limit: int = 5) -> list[dict]:
    """Retrieve relevant memories — returns empty list on any failure to keep pipeline alive."""
    if not query.strip():
        return []
    try:
        client = get_qdrant()
        vector = await _embed(query)
        res = client.query_points(
            collection_name=MEMORY_COLLECTION,
            query=vector,
            query_filter=Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))]),
            limit=limit,
        )
        hits = res.points
        return [{"text": h.payload.get("text", ""), "score": h.score} for h in hits]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Memory retrieval failed (non-fatal): %s", exc)
        return []


async def store_memory(user_id: str, text: str, metadata: dict | None = None) -> bool:
    """Store memory — returns False on failure instead of raising."""
    try:
        client = get_qdrant()
        vector = await _embed(text)
        client.upsert(
            collection_name=MEMORY_COLLECTION,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={
                        "user_id": user_id,
                        "text": text,
                        "created_at": time.time(),
                        **(metadata or {}),
                    },
                )
            ],
        )
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Memory store failed (non-fatal): %s", exc)
        return False
