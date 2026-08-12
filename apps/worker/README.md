# LifeKit — Background Worker

A lightweight TypeScript background worker service that processes asynchronous, CPU-intensive, or delayed tasks. Decoupling these processes from the main Rest API server ensures high performance and responsive user interfaces.

---

## 🛠 Tech Stack

- **Runtime**: Node.js & TypeScript
- **Queue Manager**: BullMQ (v5)
- **Redis Client**: `ioredis`
- **Infrastructure**: Redis (Broker) and PostgreSQL (Storage)

---

## ⚙️ Queue Configurations & Workers

The worker listens on three primary queues stored in Redis:

1. **`opportunity-processing`**
   - **Trigger**: New user onboarding, goal updates, or weekly cron events.
   - **Job**: Analyzes profile metrics and matches them against external listings to recommend scholarships, internships, or job postings.
2. **`progress-processing`**
   - **Trigger**: Scheduled cron job (daily/weekly).
   - **Job**: Analyzes user checkins and habits, recalculates mission progress, flags at-risk goals, and updates metrics in PostgreSQL.
3. **`notification-processing`**
   - **Trigger**: System alerts, milestone achievements, reminders.
   - **Job**: Processes and dispatches email digests, push notifications, and SMS messages.

---

## 🚀 Running the Worker

### 1. Set Up Environment Variables
Ensure a `.env` file is present in the workspace root or apps/worker folder (see [`.env.example`](../../.env.example)):
* `WORKER_REDIS_URL` — Defaults to `redis://localhost:6380`.
* `WORKER_DATABASE_URL` — Connection string to PostgreSQL.

### 2. Run Service
```bash
cd apps/worker
npm install

# Start in development mode (tsx hot reloading)
npm run dev

# Compile TypeScript
npm run build

# Run built production JavaScript
npm run start
```
The console will log worker queue registration details and begin waiting for jobs.
