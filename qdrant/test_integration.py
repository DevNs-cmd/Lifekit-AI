import os
import sys
from dotenv import load_dotenv
from openai import OpenAI, AuthenticationError
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

# Step 1: Environment & API Key Check
api_key = os.getenv("AI_SERVICE_OPENAI_API_KEY")

if not api_key or not api_key.strip():
    print("Error: AI_SERVICE_OPENAI_API_KEY environment variable is missing or empty in .env")
    sys.exit(1)

print("[1/5] Environment configuration checked: AI_SERVICE_OPENAI_API_KEY is loaded.")

# Step 2: OpenAI Embedding Generation
print("[2/5] Initializing OpenAI client & generating embedding...")
client = OpenAI(api_key=api_key)
text_to_embed = "LifeKit OpenAI + Qdrant Integration Test"

try:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text_to_embed
    )
    embedding_vector = response.data[0].embedding
    print(f"      OpenAI Embedding generated successfully! Dimension: {len(embedding_vector)}")
except AuthenticationError:
    print("      [ERROR] OpenAI AuthenticationError (401): The API key in AI_SERVICE_OPENAI_API_KEY is invalid/expired.")
    print("      Please update AI_SERVICE_OPENAI_API_KEY in your .env file with a valid OpenAI API key.")
    sys.exit(401)
except Exception as e:
    print(f"      [ERROR] Failed to generate OpenAI embedding: {e}")
    sys.exit(1)

# Step 3: Qdrant Connection & Collection Setup
qdrant_url = os.getenv("AI_SERVICE_QDRANT_URL", "http://localhost:6333")
collection_name = os.getenv("QDRANT_COLLECTION_NAME", "lifekit_embeddings")
vector_dim = len(embedding_vector)

print(f"[3/5] Connecting to Qdrant at {qdrant_url}...")
try:
    qdrant = QdrantClient(url=qdrant_url, check_compatibility=False)
    collections = [c.name for c in qdrant.get_collections().collections]

    if collection_name not in collections:
        print(f"      Creating Qdrant collection '{collection_name}' (dim={vector_dim}, distance=COSINE)...")
        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=vector_dim,
                distance=models.Distance.COSINE
            )
        )
        print(f"      Collection '{collection_name}' created.")
    else:
        print(f"      Collection '{collection_name}' already exists.")
except Exception as e:
    print(f"      [ERROR] Qdrant connection/collection error: {e}")
    sys.exit(1)

# Step 4: Upsert Vector into Qdrant
point_id = 101
payload = {
    "text": text_to_embed,
    "model": "text-embedding-3-small",
    "source": "lifekit_integration_test"
}

print(f"[4/5] Upserting embedding point (ID: {point_id}) into '{collection_name}'...")
try:
    qdrant.upsert(
        collection_name=collection_name,
        points=[
            models.PointStruct(
                id=point_id,
                vector=embedding_vector,
                payload=payload
            )
        ]
    )
    print("      Point upserted successfully.")
except Exception as e:
    print(f"      [ERROR] Failed to upsert vector: {e}")
    sys.exit(1)

# Step 5: Vector Search Verification
print(f"[5/5] Performing vector search query against '{collection_name}'...")
try:
    search_res = qdrant.query_points(
        collection_name=collection_name,
        query=embedding_vector,
        limit=1
    )
    if search_res.points:
        matched = search_res.points[0]
        print("      Vector search query succeeded!")
        print(f"      Retrieved Point ID : {matched.id}")
        print(f"      Similarity Score   : {matched.score:.4f}")
        print(f"      Retrieved Payload  : {matched.payload}")
        print("\n🎉 Full End-to-End OpenAI + Qdrant Integration Test PASSED!")
    else:
        print("      [ERROR] Vector search returned no results.")
        sys.exit(1)
except Exception as e:
    print(f"      [ERROR] Vector search failed: {e}")
    sys.exit(1)
