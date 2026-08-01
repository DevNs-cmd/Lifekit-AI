import type { ID } from "./common";

export type NotificationType =
  | "task-reminder"
  | "deadline-warning"
  | "milestone-completion"
  | "ai-recommendation"
  | "opportunity-match"
  | "marketplace-update"
  | "payment-update"
  | "system";

export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  relatedMissionId?: ID;
  relatedOpportunityId?: ID;
  relatedOrderId?: ID;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  inApp: Record<NotificationType, boolean>;
  email: Record<NotificationType, boolean>;
  push: Record<NotificationType, boolean>;
}
