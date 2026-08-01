"""Standalone Life Memory endpoints, e.g. for a "Memory" page in the app
that doesn't need to run the full orchestration pipeline."""

from fastapi import APIRouter
from pydantic import BaseModel
from app.modules.memory.service import retrieve_relevant_memory, store_memory

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


class MemoryQuery(BaseModel):
    user_id: str
    query: str
    limit: int = 5


class MemoryWrite(BaseModel):
    user_id: str
    text: str
    metadata: dict = {}


@router.post("/search")
async def search_memory(payload: MemoryQuery):
    return await retrieve_relevant_memory(payload.user_id, payload.query, payload.limit)


@router.post("/write")
async def write_memory(payload: MemoryWrite):
    written = await store_memory(payload.user_id, payload.text, payload.metadata)
    return {"written": written}
