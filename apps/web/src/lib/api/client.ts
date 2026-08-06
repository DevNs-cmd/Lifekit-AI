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

import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user";

async function getAccessToken(): Promise<string | null> {
  try {
    const token = useAuthStore.getState().accessToken;
    if (token) return token;
  } catch {
    // ignore
  }
  return "mock-access-token";
}

async function performTokenRefresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; user: unknown } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json && json.success && json.data) {
      return json.data;
    }
    return json;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, headers = {}, signal } = options;
  let token = await getAccessToken();

  let res = await fetch(buildUrl(path, params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // Intercept 401 Unauthorized for token refresh
  if (res.status === 401) {
    const rToken = useAuthStore.getState().refreshToken;
    if (rToken && rToken !== "mock-refresh-token") {
      const refreshResult = await performTokenRefresh(rToken);
      if (refreshResult && refreshResult.accessToken) {
        useAuthStore.getState().login(
          refreshResult.user as Partial<User>,
          refreshResult.accessToken,
          refreshResult.refreshToken
        );

        token = refreshResult.accessToken;
        res = await fetch(buildUrl(path, params), {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        });
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
      }
    }
  }

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

  const json = await res.json();
  if (json && typeof json === "object" && "success" in json) {
    if ("meta" in json) {
      return {
        data: json.data,
        meta: json.meta,
      } as unknown as T;
    }
    if ("data" in json) {
      return json.data as T;
    }
  }
  return json as T;
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
