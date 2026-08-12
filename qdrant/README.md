# LifeKit — Qdrant Vector Integration & Testing

**Qdrant** is the vector database powering the long-term memory (LTM), cognitive retrieval, and agentic workflows of the LifeKit-AI platform. It stores text embeddings representing user behaviors, chats, goals, and achievements, enabling semantic search and personalized agent context injection.

---

## 🛠 Configuration Details

- **Version**: Qdrant v1.10.0
- **Vector Dimensions**: `1536` (matching OpenAI's `text-embedding-3-small` model)
- **Distance Metric**: `Cosine Similarity`
- **Default Collection Name**: `lifekit_embeddings` (or configured via `QDRANT_COLLECTION_NAME`)
- **HTTP Port**: `6333`
- **gRPC Port**: `6334`

---

## 📂 Test Scripts & Purpose

This directory contains standalone python scripts used to verify OpenAI and Qdrant integration outside the FastAPI service context:

1. **[`test_qdrant.py`](./test_qdrant.py)**
   - Connects to the local Qdrant instance.
   - Verifies existing collections and creates `lifekit_embeddings` if it does not exist.
   - Generates and upserts a random test vector (dim=1536).
   - Queries Qdrant to verify vector upsert and retrieval.
2. **[`test_embedding.py`](./test_embedding.py)**
   - Connects to the OpenAI API using the `AI_SERVICE_OPENAI_API_KEY` from the `.env` file.
   - Tests generating a 1536-dimensional embedding using `text-embedding-3-small`.
3. **[`test_integration.py`](./test_integration.py)**
   - Integrates both processes (end-to-end test).
   - Generates a vector embedding from OpenAI for a string prompt, upserts it into the Qdrant database, and queries the database using the same vector to ensure semantic similarity returns a high match score.

---

## 🚀 Running the Tests

To run these verification scripts, set up your python environment:

### 1. Ensure Qdrant Container is Active
```bash
docker compose up -d qdrant
```

### 2. Set Up Virtual Environment & Dependencies
Ensure your root or regional `.env` file contains:
* `AI_SERVICE_OPENAI_API_KEY=sk-xxxx...`
* `AI_SERVICE_QDRANT_URL=http://localhost:6333`

Then run:
```bash
# Navigate to qdrant directory
cd qdrant

# You can activate the FastAPI virtual environment or create a new one:
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install required test libraries
pip install qdrant-client openai numpy python-dotenv
```

### 3. Execute Verification Scripts
```bash
# Test Qdrant connectivity and random vector search
python test_qdrant.py

# Test OpenAI API key and embedding generation
python test_embedding.py

# Run full end-to-end integration test
python test_integration.py
```
Upon a successful integration test run, the console will print:
`🎉 Full End-to-End OpenAI + Qdrant Integration Test PASSED!`
