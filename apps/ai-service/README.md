# LifeKit — AI Service (FastAPI)

The **AI Service** is the intelligence layer of the LifeKit platform. It processes natural language inputs, understands user intent, constructs structured roadmaps (Milestones/Tasks), manages long-term memory via vectors, and runs autonomous multi-agent workflows.

---

## 🛠 Tech Stack

- **Framework**: FastAPI (high-performance Python web framework)
- **Runtime**: Python 3.11+
- **Agent Orchestrator**: LangGraph (for multi-agent cyclic state graphs)
- **Chain Builder**: LangChain / LangChain-OpenAI
- **Vector Database Client**: `qdrant-client` (for semantic search & cognitive memory)
- **Model Integrations**: OpenAI (GPT-4o / GPT-4o-mini) and Gemini API compatible
- **HTTP Client**: `httpx` for asynchronous requests
- **Data Validation**: Pydantic v2 (Strict typing and settings parsing)

---

## 📂 Codebase Architecture

The service modules inside [`app/`](./app) handle isolated domains of cognitive reasoning and execution tracking:

```
app/
├── core/               # App configuration, logging, database connections
├── main.py             # FastAPI App entrypoint, middleware, routes mapping
├── schemas/            # Pydantic schemas for request/response validation
└── modules/            # Agentic & Functional sub-modules:
    ├── intent/         # Parsing goals, extracting constraints and dates
    ├── mission/        # Alignment of goals with life sectors and values
    ├── planner/        # Roadmap generation (milestones, tasks, budget estimation)
    ├── domain_agents/  # Specialized domain experts (Career, Finance, Health, Productivity, Lifestyle)
    ├── opportunity/    # Matches profile data with external opportunities
    ├── recommendation/ # Proactive tips, habit prompts, progress advice
    ├── execution/      # Task status monitoring, risk analysis, replanning
    ├── memory/         # Interacts with Qdrant to read/write memory vectors
    └── orchestrator/   # LangGraph implementation combining agents
```

---

## 🚀 Running the Service

### 1. Set Up Python Environment
Navigate to the service directory, create a virtual environment, and install dependencies:

```bash
cd apps/ai-service
python -m venv .venv

# Activate Virtual Environment:
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Make sure to configure the environment variables in a `.env` file (copied from [`.env.example`](./.env.example)):
* `AI_SERVICE_OPENAI_API_KEY` — Your OpenAI API secret key.
* `AI_SERVICE_QDRANT_URL` — Defaults to `http://localhost:6333` (Qdrant).
* `AI_SERVICE_REDIS_URL` — Defaults to `redis://localhost:6380`.

### 3. Run FastAPI Dev Server
```bash
uvicorn app.main:app --reload --port 8000
```
The server will run on [http://localhost:8000](http://localhost:8000) with interactive Swagger documentation available at `/docs`.

---

## 💾 Qdrant Vector Memory System

This service connects to the `qdrant` container via port `6333` (mapped from Docker). It maintains a collection named `user_memories` containing high-dimensional vectors representing:
* Stated user goals and values.
* Episodic memory logs (past completed tasks, achievements).
* Context extracted from AI Coach chat conversations.

Semantic retrieval queries are run to inject relevant memories into the LLM prompt context, ensuring personalized recommendations that adapt over time.
