import type { MissionStatus } from "../../types/mission";

export function normalizeMissionStatus(status: unknown): MissionStatus {
  const value = typeof status === "string" ? status.trim().toLowerCase() : "";

  switch (value) {
    case "active":
    case "activated":
    case "running":
    case "in_progress":
    case "in-progress":
      return "active";
    case "paused":
    case "suspended":
      return "paused";
    case "draft":
    case "created":
      return "draft";
    case "completed":
    case "done":
    case "finished":
      return "completed";
    case "cancelled":
    case "canceled":
    case "abandoned":
      return "cancelled";
    case "at-risk":
    case "at_risk":
    case "atrisk":
    case "warning":
    case "needs-attention":
    case "failed":
    case "failure":
      return "at-risk";
    default:
      return "active";
  }
}
