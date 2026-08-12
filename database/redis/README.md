# LifeKit — Redis Infrastructure Documentation

**Redis** serves as the in-memory data store, cache, and message broker for the LifeKit SaaS platform. It handles real-time capabilities, caching strategies, rate limiting, distributed locking, and background worker queue management.

---

## 🛠 Tech Stack & Setup

- **Version**: Redis v7.x (Alpine)
- **Container Name**: `lifekit-redis`
- **Internal Port**: `6379`
- **Host Port (Mapped)**: `6380` (defined in `docker-compose.yml`)
- **Node Client**: `ioredis` (NestJS and Worker)
- **Python Client**: `redis` (FastAPI AI Service)
- **Queue Manager**: `bullmq` (Node.js/TypeScript)

To start the Redis container:
```bash
docker compose up -d redis
```

---

## ⚡ Core Use Cases

### 1. API Rate Limiting (Throttling)
To prevent abuse of our API and expensive AI generation routes, NestJS (`@nestjs/throttler`) uses Redis to store request counters per IP address or authenticated user.

* **Key Format**: `rate_limit:user:<userId>` or `rate_limit:ip:<ipAddress>`
* **Expiration**: Fixed-window rate limiting with standard expiration TTL (e.g., 60 seconds).
* **Command Sequence**:
  ```redis
  # Set rate limit counter with a 60-second expiry
  SET rate_limit:user:1 1 EX 60
  
  # Increment counter on subsequent requests
  INCR rate_limit:user:1
  
  # Read current requests count
  GET rate_limit:user:1
  
  # Check remaining time-to-live
  TTL rate_limit:user:1
  ```

### 2. Distributed Locking
When executing background worker tasks (such as opportunity scoring or progress analytics compilation), we use distributed locks to ensure that only a single instance of a job or operation is executed at any given time.

* **Key Format**: `lock:<resourceName>:<resourceId>`
* **Expiry**: Automatically expires (typically 30 seconds) to prevent permanent deadlocks if a worker container crashes.
* **Command Sequence**:
  ```redis
  # Acquire lock atomically (NX = only if key doesn't exist, EX = expires in 30s)
  SET lock:user:1 "locked" NX EX 30
  
  # Verify who holds the lock
  GET lock:user:1
  
  # Check remaining time before automatic lock release
  TTL lock:user:1
  
  # Release lock manually (once the operation completes)
  DEL lock:user:1
  ```

### 3. Background Job Queues (BullMQ)
The background worker (`apps/worker`) and main API (`apps/api`) communicate asynchronously using Redis-backed message queues managed by **BullMQ**.

We register three key queues in Redis:
1. `opportunity-processing` — Processes and matches opportunities (jobs, internships, scholarships) using semantic similarity.
2. `progress-processing` — Runs periodic checks on user habits, goals, and compiles progress analytics.
3. `notification-processing` — Orchestrates batch push/email/SMS notifications.

Redis stores the queue data structures (hashes, sorted sets, lists) for BullMQ to schedule, pause, retry, and monitor job states.

### 4. Real-time Pub/Sub Messaging
Redis Pub/Sub channels broadcast system events to the NestJS Gateway, which pushes real-time updates to Next.js clients via WebSockets.

* **Primary Channel**: `lifekit_notifications`
* **Workflow**:
  ```redis
  # Subscribe to notifications channel (listening client)
  SUBSCRIBE lifekit_notifications
  
  # Publish events (producing server or FastAPI service)
  PUBLISH lifekit_notifications "Welcome to LifeKit!"
  PUBLISH lifekit_notifications "User 1 completed today's journal."
  PUBLISH lifekit_notifications "New mission unlocked!"
  PUBLISH lifekit_notifications "Mission completed successfully."
  PUBLISH lifekit_notifications "Complete today's journal."
  ```

### 5. Application Caching
To maintain fast load times and reduce the load on the primary PostgreSQL database:
- User sessions are cached to optimize auth checks.
- Completed plan roadmap configurations are cached in Redis.
- Frequently queried marketplace listings are cached to avoid database round-trips.

---

## 🔍 Debugging & Operations

You can connect to the Redis CLI on the host machine to inspect keys or debug Pub/Sub messages:

```bash
# Connect using local docker container CLI
docker exec -it lifekit-redis redis-cli

# Connect directly to the mapped host port
redis-cli -p 6380
```

### Useful CLI Commands:

```redis
# Check connectivity
PING
> PONG

# Select database (default: 0)
SELECT 0

# Find all active keys (avoid in production)
KEYS *

# Monitor live Redis operations
MONITOR

# Clear current database cache
FLUSHDB

# Clear all databases
FLUSHALL
```