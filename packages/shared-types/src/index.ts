/**
 * LifeKit Shared Types
 *
 * This package contains TypeScript types and contracts shared across
 * the frontend (Next.js), backend (NestJS), and worker services.
 *
 * Use shared types for:
 * - API request/response DTOs
 * - Database entity shapes
 * - WebSocket event payloads
 * - Queue job payloads
 * - Common enums and constants
 *
 * Add types here only when they are genuinely shared between
 * at least two of the application services (web, api, worker).
 */

// ─── User ─────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── WebSocket Events ─────────────────────────────
export enum WsEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",
  NOTIFICATION = "notification",
  PROGRESS_UPDATE = "progress:update",
  OPPORTUNITY_ALERT = "opportunity:alert",
}

export interface WsMessage<T = unknown> {
  event: WsEvent;
  payload: T;
  timestamp: string;
}

// ─── Queue Jobs ──────────────────────────────────
export enum QueueName {
  OPPORTUNITY_PROCESSING = "opportunity-processing",
  PROGRESS_PROCESSING = "progress-processing",
  NOTIFICATION_PROCESSING = "notification-processing",
}

export interface QueueJobPayload {
  userId: string;
  timestamp: string;
  [key: string]: unknown;
}

