# LifeKit

**LifeKit** is a SaaS platform that helps users organize, plan, and optimize their lives using AI-powered tools. It combines a modern web interface with intelligent backend services to provide personalized life management.

> 🚧 **Early Development** — This repository is actively being built by a 4-person team. See [Architecture](./docs/architecture.md) for details.

---

## 🛠 Technology Stack & Decisions

LifeKit is structured as a **monorepo** consisting of modern web, API, and orchestration technologies. Here are the core layers and our architectural decisions:

### 1. Frontend Layer (`apps/web`)
* **Next.js 16 (App Router)**: Enables Server-Side Rendering (SSR) for fast initial loads, robust layouts, and React 19 server components.
* **Tailwind CSS v4 & shadcn/ui**: Used for design system uniformity, fast styling, and high-quality Radix UI-backed accessible components.
* **Zustand**: A lightweight, fast client-side state store for authentication and UI-specific states without the boilerplate of Redux.
* **TanStack Query**: Manages server state, background caching, retries, and optimistic updates.
* **Framer Motion**: Handles smooth transitions and animations.

### 2. Core Backend Layer (`apps/api`)
* **NestJS (v11)**: Selected for its structured modular framework, built-in dependency injection, and clean architecture, which facilitates scaling.
* **REST & WebSocket (Socket.io)**: Exposes endpoints for data queries and establishes real-time connections for AI generation status and notifications.
* **Prisma ORM**: Simplifies database queries, schema migrations, and ensures full type safety across PostgreSQL operations.
* **Throttler (Rate Limiting)**: Protects server routes and expensive AI queries.

### 3. AI Service Layer (`apps/ai-service`)
* **FastAPI (Python 3.11+)**: Selected for its asynchronous capabilities and native integration with the Python AI/ML ecosystem.
* **LangGraph & LangChain**: Drives complex agentic workflows, intent understanding, and goal planning.
* **OpenAI & Gemini API**: Powers LLM reasoning, roadmapping, and specialist agent prompts.
* **Qdrant Client**: Integrates with our vector database to support user long-term memory (LTM) and semantic search.

### 4. Background Worker Layer (`apps/worker`)
* **Node.js / TypeScript**: Standalone service that runs background workers.
* **BullMQ (Redis-backed)**: Decoupled job queues processor. Separates CPU-intensive or scheduled tasks (opportunity processing, progress metrics, notifications) from the main API thread.

### 5. Data & Caching Layer
* **PostgreSQL 16**: Our primary structured relational database. Stores core user, mission, task, journal, and transaction tables.
* **Qdrant (Vector DB)**: Stores embedding vectors representing episodic and semantic user memories.
* **Redis 7**: In-memory database utilized as a multi-purpose cache, BullMQ backing store, distributed locker, and websocket pub/sub message broker.

---

## 📂 Repository Structure

```
lifekit-ai/
├── apps/
│   ├── web/              # Next.js frontend (React, Tailwind, shadcn/ui)
│   ├── api/              # NestJS core backend (REST + WebSocket)
│   ├── ai-service/       # FastAPI AI orchestration service
│   └── worker/           # Background worker service
├── packages/
│   └── shared-types/     # Shared TypeScript types/contracts
├── database/             # PostgreSQL database schemas and seeding scripts
│   ├── redis/            # Redis configuration and command reference
│   ├── schema.sql        # Database schema dump
│   └── seed.sql          # Seed data script
├── qdrant/               # Qdrant vector database testing and setups
├── docs/                 # System architecture and workflow guides
├── infrastructure/
│   ├── docker/           # Dockerfiles and setups
│   └── nginx/            # Reverse proxy setup
├── docker-compose.yml    # Orchestrates local services
├── .env.example          # Environment variables template
└── README.md             # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.11+
- **Docker** and **Docker Compose**
- **Git**

---

### Step 1: Clone and Set Up Environment

```bash
git clone https://github.com/your-org/lifekit-ai.git
cd lifekit-ai
cp .env.example .env
```
*Make sure to configure the `.env` file with your local environment setup (especially your OpenAI API Key).*

---

### Step 2: Start Infrastructure Services

Use Docker Compose to run PostgreSQL, Redis, and Qdrant in the background:
```bash
docker compose up -d postgres redis qdrant
```

---

### Step 3: Set Up and Seed the Database

Once the PostgreSQL container is healthy, restore the database schema and seed data:

```bash
# Import the schema
docker exec -i lifekit-postgres psql -U lifekit -d lifekit < database/schema.sql

# Import seed data
docker exec -i lifekit-postgres psql -U lifekit -d lifekit < database/seed.sql
```

Then generate the Prisma client for the API project:
```bash
# From the root directory:
npx prisma generate
```

---

### Step 4: Run the Applications

For development, run each application in a separate terminal window:

#### 1. Next.js Frontend
```bash
cd apps/web
npm install
npm run dev
```
*Frontend opens at [http://localhost:3000](http://localhost:3000).*

#### 2. NestJS Backend
```bash
cd apps/api
npm install
npm run start:dev
```
*Backend runs at [http://localhost:4000](http://localhost:4000).*

#### 3. FastAPI AI Service
```bash
cd apps/ai-service
python -m venv .venv

# Activate Virtual Environment:
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*AI Service runs at [http://localhost:8000](http://localhost:8000).*

#### 4. Background Worker
```bash
cd apps/worker
npm install
npm run dev
```

---

## 🔌 Port Mapping & Service Reference

To run services locally and avoid port conflicts, the host ports are mapped as follows in `docker-compose.yml`:

| Service / App | Host Mapped Port | Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Next.js Frontend** | `3000` | `3000` | User Web Interface |
| **NestJS API** | `4000` | `4000` | Primary Backend API Gateway |
| **FastAPI Service** | `8000` | `8000` | AI Processing Orchestrator |
| **PostgreSQL** | `5434` | `5432` | Primary Structured Database |
| **Redis** | `6380` | `6379` | In-memory Cache & Message Broker |
| **Qdrant (HTTP)** | `6333` | `6333` | Vector Database (REST API) |
| **Qdrant (gRPC)** | `6334` | `6334` | Vector Database (gRPC interface) |

---

## 🤝 Collaborative Git Workflow

We follow standard branches and conventional commits to maintain a clean history. See [docs/git-workflow.md](./docs/git-workflow.md) for full branch naming structures and conventions.

* **Main Branch**: `main` (always stable)
* **Feature Branches**: `feature/short-desc`
* **Bug Fixes**: `fix/short-desc`
* **Commit Conventions**: `feat: add mission generator`, `fix: auth redirect`, etc.
