import { CacheController } from "@/cache/cacheController";
import {
  alertResolve,
  alertSnooze,
} from "@/infrastructure/api-clients/settings/notifications.clients";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const NOTIFICATIONS_STORE_KEY = "notif-store";

export type NotificationKind =
  | "email"
  | "new_comment"
  | "system"
  | "opportunity"
  | "task"
  | "alert"
  | "generic";

export type NotificationLevel = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  level: NotificationLevel;

  actorName?: string;
  actorAvatar?: string | null;

  action?: string;
  target?: string;
  message?: string;

  createdAt: string; // ISO
  read: boolean;

  linkUrl: string;

  // ✅ Posponer
  snoozedUntil?: string | null;
  snoozeNote?: string | null;

  // ✅ Resuelto
  isResolved?: boolean;

  finishDate?: Date;
  payload?: any;
}

function safeTime(x?: string | null) {
  if (!x) return null;
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function computeUnread(list: NotificationItem[]) {
  const now = Date.now();
  return list.filter((n) => {
    if (n.isResolved) return false;

    const snoozeTs = safeTime(n.snoozedUntil);
    if (snoozeTs && snoozeTs > now) return false;

    return !n.read;
  }).length;
}

export async function apiResolve(id: string) {
  await alertResolve(Number(id));
  await CacheController.invalidate("opportunities", "notifications");
}

export async function apiSnooze(id: string, untilAt: Date, note?: string) {
  await alertSnooze(Number(id), untilAt, note ?? "");
  await CacheController.invalidate("opportunities", "notifications");
}

interface NotificationsState {
  list: NotificationItem[];
  unread: number;

  add: (item: NotificationItem) => void;
  setList: (items: NotificationItem[]) => void;

  markOneRead: (id: string) => void;
  markAllRead: () => void;

  resolve: (id: string) => Promise<void>;
  snooze: (id: string, untilAt: Date, note?: string) => Promise<void>;

  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      list: [],
      unread: 0,

      add: (item) =>
        set((state) => {
          const list = [item, ...state.list];
          return { list, unread: computeUnread(list) };
        }),

      setList: (items) =>
        set(() => ({
          list: items,
          unread: computeUnread(items),
        })),

      markOneRead: (id) =>
        set((state) => {
          const list = state.list.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          return { list, unread: computeUnread(list) };
        }),

      markAllRead: () =>
        set((state) => {
          const list = state.list.map((n) => ({ ...n, read: true }));
          return { list, unread: computeUnread(list) };
        }),

      resolve: async (id) => {
        const prev = get().list;

        const optimistic = prev.map((n) =>
          n.id === id ? { ...n, isResolved: true } : n,
        );
        set({ list: optimistic, unread: computeUnread(optimistic) });

        try {
          await apiResolve(id);
        } catch (e) {
          set({ list: prev, unread: computeUnread(prev) });
          throw e;
        }
      },

      snooze: async (id, untilAt, note) => {
        const prev = get().list;
        const untilIso = untilAt.toISOString();

        const optimistic = prev.map((n) =>
          n.id === id
            ? { ...n, snoozedUntil: untilIso, snoozeNote: note ?? null }
            : n,
        );

        set({ list: optimistic, unread: computeUnread(optimistic) });

        try {
          await apiSnooze(id, untilAt, note);
        } catch (e) {
          set({ list: prev, unread: computeUnread(prev) });
          throw e;
        }
      },

      reset: () => set({ list: [], unread: 0 }),
    }),
    {
      name: NOTIFICATIONS_STORE_KEY,
      version: 1,
      partialize: (s) => ({ list: s.list }),
    },
  ),
);

export function clearPersistedNotifications() {
  useNotificationsStore.getState().reset();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(NOTIFICATIONS_STORE_KEY);
  }
}
