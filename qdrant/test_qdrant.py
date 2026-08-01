import os
import sys
import numpy as np
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

qdrant_url = os.getenv("AI_SERVICE_QDRANT_URL", "http://localhost:6333")
collection_name = os.getenv("QDRANT_COLLECTION_NAME", "lifekit_embeddings")
vector_dim = 1536  # text-embedding-3-small dimension

print(f"Connecting to Qdrant at: {qdrant_url}")

try:
    client = QdrantClient(url=qdrant_url, check_compatibility=False)
    # Test connection
    collections = client.get_collections()
    print("Qdrant connection successful!")
    existing_collections = [c.name for c in collections.collections]
    print(f"Existing collections: {existing_collections}")

    # Check or create collection
    if collection_name not in existing_collections:
        print(f"Creating collection '{collection_name}' with size {vector_dim} and Cosine distance...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=vector_dim,
                distance=models.Distance.COSINE
            )
        )
        print(f"Collection '{collection_name}' created successfully.")
    else:
        print(f"Collection '{collection_name}' already exists.")

    # Generate a dummy test vector for verification
    dummy_vector = np.random.uniform(-1.0, 1.0, vector_dim).tolist()

    # Insert test vector
    point_id = 1
    payload = {
        "text": "LifeKit Qdrant integration test payload",
        "source": "qdrant_test_script"
    }

    print(f"Inserting test point (ID: {point_id}) into '{collection_name}'...")
    client.upsert(
        collection_name=collection_name,
        points=[
            models.PointStruct(
                id=point_id,
                vector=dummy_vector,
                payload=payload
            )
        ]
    )
    print("Test point inserted successfully!")

    # Retrieve / Vector Search test using query_points
    print("Performing vector search query...")
    response = client.query_points(
        collection_name=collection_name,
        query=dummy_vector,
        limit=1
    )

    search_results = response.points

    if search_results:
        retrieved_point = search_results[0]
        print("Vector search succeeded!")
        print(f"Retrieved Point ID: {retrieved_point.id}")
        print(f"Similarity Score: {retrieved_point.score:.4f}")
        print(f"Payload: {retrieved_point.payload}")
    else:
        print("Error: Vector search returned no results.")
        sys.exit(1)

except Exception as e:
    print(f"Qdrant Error: {e}")
    sys.exit(1)
