# LifeKit — Shared Types (`@lifekit/shared-types`)

This workspace package contains the shared TypeScript types, interfaces, enums, and API/WebSocket contracts utilized across the Next.js frontend, NestJS backend, and background worker services.

Keeping all schemas and contracts in a single package ensures type-safety across service boundaries and prevents type drift between client and server logic.

---

## 📂 Contents

The package exports types in [src/index.ts](./src/index.ts):

### 1. User Interface
* **`User`**: Defines the user entity structure returned by APIs.
  ```typescript
  export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }
  ```

### 2. Standard API Request/Response Shapes
* **`ApiResponse<T>`**: Standard response wrapper for API requests.
* **`PaginatedResponse<T>`**: Standard wrapper for paginated collections (such as missions, lists).

### 3. WebSocket Event Contracts
* **`WsEvent`**: Enum defining all real-time events.
  - `WsEvent.NOTIFICATION` — New system alerts/pushes.
  - `WsEvent.PROGRESS_UPDATE` — Real-time progress metric updates.
  - `WsEvent.OPPORTUNITY_ALERT` — High-score matches from the opportunity generator.
* **`WsMessage<T>`**: Wrapper structure containing the WebSocket event name, generic payload `T`, and a timestamp.

### 4. Background Job Queues
* **`QueueName`**: Enum matching our Redis queues:
  - `opportunity-processing`
  - `progress-processing`
  - `notification-processing`
* **`QueueJobPayload`**: Interface for arguments queued to BullMQ workers.

---

## 🛠 Usage & Integration

### Adding a Type
1. Modify [`src/index.ts`](./src/index.ts) to add or update definitions.
2. Build the types package so other workspaces compile properly:
   ```bash
   cd packages/shared-types
   npm run build
   ```

### Consuming in Other Apps
Import type definitions directly from the package reference inside `apps/web`, `apps/api`, or `apps/worker`:

```typescript
import { User, WsEvent, QueueName } from '@lifekit/shared-types';
```
