"""Life Memory — long-term semantic memory per user, backed by Qdrant.
Read once at the start of orchestration (relevant context), written once
at the end (what happened + what was decided)."""

import time
import uuid
from openai import AsyncOpenAI
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue
from app.config import settings
from app.core.vector_store import get_qdrant, MEMORY_COLLECTION

_openai = AsyncOpenAI(api_key=settings.openai_api_key)


async def _embed(text: str) -> list[float]:
    resp = await _openai.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding


async def retrieve_relevant_memory(user_id: str, query: str, limit: int = 5) -> list[dict]:
    if not query.strip():
        return []
    client = get_qdrant()
    vector = await _embed(query)
    hits = client.search(
        collection_name=MEMORY_COLLECTION,
        query_vector=vector,
        query_filter=Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))]),
        limit=limit,
    )
    return [{"text": h.payload.get("text", ""), "score": h.score} for h in hits]


async def store_memory(user_id: str, text: str, metadata: dict | None = None) -> bool:
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
