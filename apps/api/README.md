# LifeKit — Core Backend (NestJS API)

This is the primary application API server for **LifeKit**. Built with **NestJS**, it handles business logic orchestration, authentication, REST endpoints, real-time WebSocket communication, and interfaces with databases (PostgreSQL, Redis) and auxiliary services.

---

## 🛠 Tech Stack

- **Framework**: NestJS (v11) & Node.js
- **Language**: TypeScript
- **ORM**: Prisma Client v7
- **Database**: PostgreSQL (Relational)
- **Cache / Queue**: Redis (via `ioredis` and `BullMQ`)
- **WebSockets**: `@nestjs/websockets` (Socket.io)
- **Authentication**: Passport JWT (`jsonwebtoken` + `bcrypt` passwords)
- **Validation**: `class-validator` and `class-transformer`
- **Rate Limiting**: `@nestjs/throttler`

---

## 📂 Project Architecture

The NestJS backend follows a clean modular monolith approach. The codebase under [`src/`](./src) is structured by feature area:

```
src/
├── agents/             # Routing and chat gateways for specialist AI agents
├── auth/               # Passport JWT authentication strategy, login, sign up
├── billing/            # Stripe/Razorpay logic and user subscriptions
├── common/             # Shared infrastructure providers:
│   ├── cache/          # Redis-backed cache interceptors and modules
│   ├── queue/          # BullMQ queue managers and job producers
│   ├── upload/         # AWS S3-compatible file/image uploader
│   └── middleware/     # Request logging and request-id tracing
├── config/             # Config loaders and validation schemas
├── health/             # Health check endpoints for Docker & container orchestrators
├── life-mission/       # Core CRUD for life goals, roadmaps, and milestones
├── main.ts             # Server entry point (cors, swagger, logging)
├── marketplace/        # Services catalog listing and transaction flow
├── memory/             # Semantic & episodic memory management
├── notifications/      # Real-time WebSockets notifications dispatch
├── opportunities/      # Matching career/education opportunities
├── planner/            # Integrates goal roadmapping with the AI Service
├── prisma/             # Prisma client connection and database provider
├── recommendations/    # AI-powered dashboard recommendations
├── tasks/              # Task lists, subtasks, checklists, status trackers
└── users/              # Profiles, preferences, skills, and account metrics
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Make sure a `.env` file is present in the workspace root or apps/api folder with valid PostgreSQL, Redis, and AI Service variables (see [`.env.example`](../../.env.example)).

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Database Client (Prisma)
Ensure the Prisma client is updated to match the PostgreSQL schema:
```bash
npx prisma generate
```

### 4. Run Server
```bash
# Start in development mode (watches for file changes)
npm run start:dev

# Build production distribution
npm run build

# Start production server
npm run start:prod
```
The API server starts at [http://localhost:4000](http://localhost:4000).

---

## 🧪 Testing & Linting

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run linter
npm run lint
```
