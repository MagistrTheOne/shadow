"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getTrpcClient } from "@/lib/trpc-utils";

type NotificationItem = {
  id: string;
  type: string;
  fromUserId: string | null;
  metadata: any;
  isRead: boolean;
  createdAt: string;
  fromUser?: {
    id: string | null;
    name?: string | null;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
};

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  offset: number;
  limit: number;
  hasMore: boolean;
  // actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  refresh: () => Promise<void>;
  loadNext: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools((set, get) => ({
    items: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    offset: 0,
    limit: 20,
    hasMore: true,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),

    refresh: async () => {
      const { limit } = get();
      set({ isLoading: true });
      try {
        const client = getTrpcClient();
        const [list, count] = await Promise.all([
          client.notifications.getUnread.query({ limit, offset: 0 }),
          client.notifications.getUnreadCount.query(),
        ]);
        set({
          items: list.notifications as NotificationItem[],
          unreadCount: count.count,
          offset: list.notifications.length,
          hasMore: list.totalCount > list.notifications.length,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    loadNext: async () => {
      const { limit, offset, items, hasMore } = get();
      if (!hasMore) return;
      set({ isLoading: true });
      try {
        const client = getTrpcClient();
        const list = await client.notifications.getUnread.query({ limit, offset });
        set({
          items: [...items, ...(list.notifications as NotificationItem[])],
          offset: offset + list.notifications.length,
          hasMore: list.totalCount > offset + list.notifications.length,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    markRead: async (id: string) => {
      // optimistic
      set((s) => ({
        items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
      try {
        const client = getTrpcClient();
        await (client.notifications.markAsRead as any)({ notificationId: id });
      } catch {
        // rollback
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
          unreadCount: s.unreadCount + 1,
        }));
      }
    },

    markAllRead: async () => {
      const prevItems = get().items;
      set({ items: prevItems.map((n) => ({ ...n, isRead: true })), unreadCount: 0 });
      try {
        const client = getTrpcClient();
        await (client.notifications.markAllAsRead as any)();
      } catch {
        set({ items: prevItems });
        const client = getTrpcClient();
        const count = await client.notifications.getUnreadCount.query();
        set({ unreadCount: count.count });
      }
    },

    remove: async (id: string) => {
      const prev = get().items;
      set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
      try {
        const client = getTrpcClient();
        await (client.notifications.deleteNotification as any)({ notificationId: id });
      } catch {
        set({ items: prev });
      }
    },

    clearAll: async () => {
      const prev = get().items;
      set({ items: [], unreadCount: 0, offset: 0, hasMore: false });
      try {
        const client = getTrpcClient();
        await (client.notifications.deleteAll as any)();
      } catch {
        set({ items: prev });
      }
    },
  }))
);
