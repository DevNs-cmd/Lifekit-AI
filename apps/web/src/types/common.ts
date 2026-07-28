// ============================================================
// Common/shared types
// ============================================================

export type ID = string;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export type Category =
  | "career"
  | "finance"
  | "health"
  | "travel"
  | "business"
  | "education"
  | "productivity"
  | "personal-development"
  | "lifestyle"
  | "family";

export interface DateRange {
  from: Date;
  to?: Date;
}

export type Priority = "low" | "medium" | "high" | "urgent";

export type ThemeMode = "light" | "dark" | "system";
