// ============================================================
// LifeKit API Client – typed base layer
// All actual API calls go through this client; never fetch()
// directly inside UI components.
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function getAccessToken(): Promise<string | null> {
  // In production this would read from the auth session / cookie.
  // For the mock implementation we return a placeholder.
  return "mock-access-token";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, headers = {}, signal } = options;
  const token = await getAccessToken();

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let errorBody: { message?: string; code?: string; details?: Record<string, string[]> } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      errorBody.code ?? "UNKNOWN",
      errorBody.message ?? `HTTP ${res.status}`,
      errorBody.details
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Convenience wrappers
export const get = <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const post = <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "POST", body });

export const put = <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "PUT", body });

export const patch = <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "PATCH", body });

export const del = <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });
