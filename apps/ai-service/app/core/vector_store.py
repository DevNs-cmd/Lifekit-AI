"""Qdrant client singleton + collection bootstrap for Life Memory."""

from functools import lru_cache
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.config import settings

MEMORY_COLLECTION = "life_memory"
EMBEDDING_DIM = 1536  # text-embedding-3-small


@lru_cache
def get_qdrant() -> QdrantClient:
    client = QdrantClient(url=settings.qdrant_url)
    existing = [c.name for c in client.get_collections().collections]
    if MEMORY_COLLECTION not in existing:
        client.create_collection(
            collection_name=MEMORY_COLLECTION,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )
    return client
