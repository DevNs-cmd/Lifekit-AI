import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date helpers ──────────────────────────────────────────
export function formatDate(date: string | Date, pattern = "dd MMM yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDeadline(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Due today";
  if (isTomorrow(d)) return "Due tomorrow";
  if (isPast(d)) return `Overdue · ${format(d, "dd MMM")}`;
  return format(d, "dd MMM yyyy");
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), "h:mm a");
}

// ── Number / currency helpers ─────────────────────────────
export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── String helpers ────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Progress helpers ──────────────────────────────────────
export function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function progressLabel(value: number): string {
  if (value === 0) return "Not started";
  if (value < 25) return "Just started";
  if (value < 50) return "In progress";
  if (value < 75) return "Well underway";
  if (value < 100) return "Almost there";
  return "Completed";
}

// ── Array helpers ─────────────────────────────────────────
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ── Misc ──────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
