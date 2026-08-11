from __future__ import annotations
"""Life Memory — long-term semantic memory per user, backed by Qdrant.
Read once at the start of orchestration (relevant context), written once
at the end (what happened + what was decided).

Every write is mirrored into the `ai_memory` Postgres table (same table
the NestJS API's /memories endpoint reads for the "Life Memory" page),
using the Qdrant point id as embedding_id so the two stores stay linked.
Without this mirror, memories written here never appear on that page."""

import asyncio
import json
import time
import uuid
import logging
from openai import AsyncOpenAI
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue
from sqlalchemy import create_engine, text
from app.config import settings
from app.core.vector_store import get_qdrant, MEMORY_COLLECTION

logger = logging.getLogger(__name__)

_pg_engine = None


def _get_pg_engine():
    """Lazily create a sync SQLAlchemy engine to the shared Postgres DB
    (same database_url the NestJS API uses). Cached across calls."""
    global _pg_engine
    if _pg_engine is None:
        _pg_engine = create_engine(settings.database_url, pool_pre_ping=True)
    return _pg_engine


def _insert_ai_memory_row(user_id: str, text_content: str, embedding_id: str, metadata: dict) -> None:
    """Sync insert into ai_memory — run via asyncio.to_thread since this
    uses a sync (psycopg2) engine. Mirrors the shape NestJS's
    MemoryRepository.createMemory writes, so the frontend's existing
    content-parsing logic (JSON with a "text" field) works unchanged."""
    content_payload = json.dumps({
        "text": text_content,
        "metadata": metadata or {},
        "contextInfo": None,
        "relatedMissionId": None,
    })
    engine = _get_pg_engine()
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                INSERT INTO ai_memory (user_id, memory_type, title, content, embedding_id, created_at, updated_at)
                VALUES (:user_id, 'CONVERSATION', :title, :content, :embedding_id, now(), now())
                """
            ),
            {
                "user_id": int(user_id),
                "title": text_content[:255],
                "content": content_payload,
                "embedding_id": embedding_id,
            },
        )


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
    """Store memory — returns False on failure instead of raising.

    Writes to both stores: Qdrant (semantic retrieval, used by
    retrieve_relevant_memory) and Postgres ai_memory (used by the
    "Life Memory" page via the NestJS /memories API). The same id is
    used for both so they stay linked via embedding_id."""
    point_id = str(uuid.uuid4())
    qdrant_ok = False
    try:
        client = get_qdrant()
        vector = await _embed(text)
        client.upsert(
            collection_name=MEMORY_COLLECTION,
            points=[
                PointStruct(
                    id=point_id,
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
        qdrant_ok = True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Memory store (Qdrant) failed (non-fatal): %s", exc)

    pg_ok = False
    try:
        await asyncio.to_thread(_insert_ai_memory_row, user_id, text, point_id, metadata or {})
        pg_ok = True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Memory store (Postgres/ai_memory) failed (non-fatal): %s", exc)

    return qdrant_ok or pg_ok
