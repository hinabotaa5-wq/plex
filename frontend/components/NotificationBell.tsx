"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  ApiError,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";
import type { Notification } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

function destinationFor(notification: Notification): string {
  if (!notification.scout_id) return "/dashboard";
  if (notification.action_type === "message_received") {
    return `/dashboard?chatScoutId=${notification.scout_id}`;
  }
  return `/dashboard?scoutId=${notification.scout_id}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
      }
    }
  }, [logout, router]);

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [open, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  async function handleReadAll() {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.push("/login");
      }
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    setOpen(false);
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.push("/login");
          return;
        }
      }
    }
    router.push(destinationFor(notification));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unreadCount > 0 ? `通知（未読${unreadCount}件）` : "通知"}
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open && (
        <div
          role="menu"
          className="fixed inset-x-4 top-[calc(3.5rem+env(safe-area-inset-top))] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900">通知</p>
            <button
              type="button"
              disabled={unreadCount === 0 || markingAll}
              onClick={() => void handleReadAll()}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              すべて既読
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              通知はありません
            </p>
          ) : (
            <ul className="max-h-[min(20rem,calc(100dvh-8rem))] overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleNotificationClick(notification)}
                    className={`block w-full px-4 py-3 text-left hover:bg-zinc-50 ${
                      notification.is_read ? "bg-white" : "bg-zinc-50"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        notification.is_read
                          ? "font-normal text-zinc-700"
                          : "font-medium text-zinc-900"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {notification.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                        {notification.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDate(notification.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
