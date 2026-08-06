"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { notificationsApi } from "@/lib/api";
import { useUIStore } from "@/stores/ui-store";
import { formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Notification } from "@/types/notification";

const TYPE_COLORS: Record<string, string> = {
  "task-reminder":       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "deadline-warning":    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "milestone-completion":"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "ai-recommendation":   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "opportunity-match":   "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "marketplace-update":  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "payment-update":      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "system":              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationCount } = useUIStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await notificationsApi.getNotifications();
        setNotifications(list);
      } catch {
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  useEffect(() => {
    setUnreadNotificationCount(unreadCount);
  }, [unreadCount, setUnreadNotificationCount]);

  async function markRead(id: string) {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Failed to update notification.");
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(unread.map(n => notificationsApi.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  }

  async function deleteNotif(id: string) {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast("Notification removed.");
    } catch {
      toast.error("Failed to remove notification.");
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Bell className="h-6 w-6 text-[hsl(var(--primary))]" /> Notifications
          </h1>
          {unreadCount > 0 ? (
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm text-[hsl(var(--text-secondary))]">All caught up</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-8 w-8" />}
          title="You're all caught up!"
          description="No notifications right now. Check back later."
        />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-[hsl(var(--border))]">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 hover:bg-[hsl(var(--background-subtle))] transition-colors",
                  !notif.isRead && "bg-[hsl(var(--background-subtle))]"
                )}
              >
                {/* Unread dot */}
                {!notif.isRead ? (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]"
                    aria-label="Unread"
                  />
                ) : (
                  <span className="mt-2 h-2 w-2 shrink-0" aria-hidden />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Type badge */}
                      <span
                        className={cn(
                          "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 capitalize",
                          TYPE_COLORS[notif.type] ?? TYPE_COLORS.system
                        )}
                      >
                        {notif.type.replace(/-/g, " ")}
                      </span>

                      <p className={cn(
                        "text-sm text-[hsl(var(--text-primary))]",
                        !notif.isRead && "font-semibold"
                      )}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-1">
                        {formatRelativeTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => markRead(notif.id)}
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteNotif(notif.id)}
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
