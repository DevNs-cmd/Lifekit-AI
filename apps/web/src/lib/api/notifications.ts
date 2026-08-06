/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, patch, del } from "./client";
import type { Notification } from "@/types/notification";

function mapBackendNotificationToFrontend(n: any): Notification {
  return {
    id: String(n.notification_id || n.id),
    userId: String(n.user_id || n.userId || "1"),
    type: (n.notification_type || n.type || "system").toLowerCase() as any,
    title: n.title || "",
    message: n.message || "",
    isRead: n.is_read ?? n.isRead ?? false,
    createdAt: n.created_at || n.createdAt || new Date().toISOString(),
  };
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await get<{ data: any[] }>("/notifications");
  const list = res?.data || [];
  return list.map(mapBackendNotificationToFrontend);
}

export async function markAsRead(id: string | number): Promise<void> {
  await patch<void>(`/notifications/${id}/read`);
}

export async function deleteNotification(id: string | number): Promise<void> {
  await del<void>(`/notifications/${id}`);
}
