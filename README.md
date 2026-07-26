# LifeKit

**LifeKit** is a SaaS platform that helps users organize, plan, and optimize their lives using AI-powered tools. It combines a modern web interface with intelligent backend services to provide personalized life management.

> 🚧 **Early Development** — This repository is actively being built by a 4-person team. See [Architecture](./docs/architecture.md) for details.

---

## Repository Structure

```
lifekit-ai/
├── apps/
│   ├── web/              # Next.js frontend (React, Tailwind, shadcn/ui)
│   ├── api/              # NestJS core backend (REST + WebSocket)
│   ├── ai-service/       # FastAPI AI orchestration service
│   └── worker/           # Background worker service
├── packages/
│   └── shared-types/     # Shared TypeScript types/contracts
├── infrastructure/
│   ├── docker/           # Docker-related configuration files
│   └── nginx/            # NGINX reverse proxy configuration
├── docs/                 # Architecture and design documentation
├── docker-compose.yml    # Local infrastructure (PostgreSQL, Redis, Qdrant)
├── .env.example          # Environment variable template
└── README.md
```

---

## Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.11+
- **Docker** and **Docker Compose** (for infrastructure services)
- **Git** (for version control)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/lifekit-ai.git
cd lifekit-ai
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration.

### 3. Start Infrastructure Services

Run PostgreSQL, Redis, and Qdrant using Docker Compose:

```bash
docker compose up -d
```

### 4. Run the Frontend (Next.js)

```bash
cd apps/web
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### 5. Run the NestJS Backend

```bash
cd apps/api
npm install
npm run start:dev
```

Runs at [http://localhost:4000](http://localhost:4000).

### 6. Run the FastAPI AI Service

```bash
cd apps/ai-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs at [http://localhost:8000](http://localhost:8000).

### 7. Run the Worker

```bash
cd apps/worker
npm install
npm run dev
```

---

## Team Development Workflow

We follow a simple feature-branch workflow:

1. **`main` branch** — Always stable and deployable
2. **Feature branches** — Created from `main` for new work
3. **Pull Requests** — All changes go through PRs

### Branch Naming

```
feature/description       # New features
fix/description           # Bug fixes
chore/description         # Maintenance tasks
docs/description          # Documentation changes
```

### Workflow Steps

1. Pull the latest `main`: `git checkout main && git pull`
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -m "feat: add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request into `main`
6. Request a review from at least one team member
7. Merge after approval

### Commit Convention

We use conventional commits:
- `feat:` — A new feature
- `fix:` — A bug fix
- `chore:` — Maintenance tasks
- `docs:` — Documentation changes
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests

---

## Docker Compose Services

| Service    | Port  | Description                |
|-----------|-------|----------------------------|
| PostgreSQL | 5432  | Primary structured database |
| Redis      | 6379  | Cache and message queue     |
| Qdrant     | 6333  | Vector database / memory    |

Start all services:

```bash
docker compose up -d
```

Stop all services:

```bash
docker compose down
```

---

## Tech Stack

| Layer           | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Core Backend   | NestJS, Node.js, TypeScript, REST, WebSocket |
| AI Service     | FastAPI, Python, LangGraph-compatible modules |
| Worker         | Node.js/TypeScript with Redis-backed queues |
| Database       | PostgreSQL (primary), Qdrant (vector) |
| Cache/Queue    | Redis                               |
| Proxy          | NGINX                               |
| Infrastructure | Docker Compose                      |

