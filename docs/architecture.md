# LifeKit — System Architecture

## High-Level Architecture

LifeKit follows a **modular monolith** architecture with a clear separation of concerns across four main application services:

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Next.js  │────▶│  NestJS  │────▶│  FastAPI AI  │
│  Frontend │     │   Core   │     │   Service    │
│   :3000   │     │  :4000   │     │    :8000     │
└──────────┘     └────┬─────┘     └──────┬───────┘
                      │                  │
                      ▼                  ▼
               ┌────────────┐    ┌──────────────┐
               │ PostgreSQL  │    │    Qdrant     │
               │  (Primary)  │    │   (Vector)    │
               └──────┬─────┘    └──────┬────────┘
                      │                  │
                      ▼                  ▼
               ┌─────────────────────────────┐
               │           Redis              │
               │   (Cache + Message Queue)    │
               └──────────────┬──────────────┘
                              │
                              ▼
                       ┌────────────┐
                       │   Worker    │
                       │  (Background)│
                       └────────────┘
```

## Component Responsibilities

### Next.js Frontend (apps/web)

- **Role**: User-facing web application
- **Handles**: UI rendering, client-side state, routing, authentication UI
- **Communicates with**: NestJS API (REST + WebSocket)
- **State management**: Zustand for global client state
- **Styling**: Tailwind CSS + shadcn/ui components
- **Responsibilities**:
  - Render all user interfaces
  - Manage client-side routing
  - Handle form validation and user input
  - Display real-time updates via WebSocket
  - Authenticate users and manage sessions

### NestJS Core Backend (apps/api)

- **Role**: Primary API server and business logic layer
- **Handles**: REST API endpoints, WebSocket connections, business logic, data persistence
- **Communicates with**: PostgreSQL, Redis, FastAPI AI Service (internal HTTP), Worker (via Redis)
- **Architecture**: Modular monolith with feature modules
- **Responsibilities**:
  - Expose RESTful API for the frontend
  - Manage WebSocket connections for real-time features
  - Orchestrate business workflows
  - Authenticate and authorize requests
  - Manage user data in PostgreSQL
  - Cache frequently accessed data in Redis
  - Delegate AI tasks to the FastAPI service
  - Enqueue background jobs to Redis for workers

### FastAPI AI Service (apps/ai-service)

- **Role**: AI orchestration and machine learning layer
- **Handles**: AI-powered features, embeddings, vector search, LLM interactions
- **Communicates with**: NestJS (via HTTP), Qdrant (vector DB), Redis (cache)
- **Architecture**: Modular AI modules following LangGraph-compatible patterns
- **Responsibilities**:
  - Intent Understanding — parse user goals and intentions
  - Life Mission Engine — align tasks with user's life mission
  - AI Planner — generate and optimize plans
  - Domain Agents — specialized agents for different life domains
  - Discovery Engine — discover opportunities and insights
  - Recommendation Engine — generate personalized recommendations
  - Execution Intelligence — guide task execution and adaptation
  - Memory Service — manage long-term and episodic memory via Qdrant

### Redis

- **Role**: In-memory data store for caching and message brokering
- **Responsibilities**:
  - Cache frequently accessed API responses
  - Session store for user sessions
  - Pub/Sub for real-time event broadcasting
  - Message queue (Bull/BullMQ) for background job processing
  - Rate limiting counters

### PostgreSQL

- **Role**: Primary structured data store
- **Responsibilities**:
  - Store all application entities (users, plans, tasks, etc.)
  - Maintain relational integrity
  - Support complex queries and reporting
  - Transactional data operations

### Qdrant

- **Role**: Vector database for semantic search and memory
- **Responsibilities**:
  - Store and index vector embeddings
  - Power semantic search across user content
  - Maintain long-term memory vectors for the AI service
  - Enable similarity-based recommendations

### Background Worker (apps/worker)

- **Role**: Process background jobs asynchronously
- **Handles**: Long-running or deferred tasks that don't need immediate response
- **Communicates with**: Redis (job queue), PostgreSQL (data), AI Service (AI tasks)
- **Worker Modules**:
  - **Opportunity Processing** — analyze and score discovered opportunities
  - **Progress Processing** — track and update user progress metrics
  - **Notification Processing** — send push/email notifications

