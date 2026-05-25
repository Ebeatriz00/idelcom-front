import type { NotificationPersist } from "@/application";
import {
  fetchNotificationsList,
  markAllNotificationsRead,
  markNotificationRead,
  type PagedResult,
} from "@/infrastructure/api-clients/settings/notifications.clients";

import { useQuery, useQueryClient } from "@tanstack/react-query";
type IdLike = string | number;

function nowIsoDate(): Date {
  return new Date();
}

function isSameId(a: unknown, b: unknown) {
  return String(a) === String(b);
}

export const qkNotifications = {
  all: ["notifications"] as const,

  infinite: (search: string, pageSize: number) =>
    [...qkNotifications.all, "infinite", pageSize, search] as const,

  lists: () => [...qkNotifications.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkNotifications.lists(), pageIndex, pageSize, search ?? ""] as const,

};

export function useNotificationsList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  enabled: boolean = true,
) {
  const s = (search ?? "").trim();

  return useQuery<PagedResult<NotificationPersist>>({
    queryKey: qkNotifications.list(pageIndex, pageSize, s),
    queryFn: () =>
      fetchNotificationsList({
        page: pageIndex + 1,
        pageSize,
        search: s,
      }),
    placeholderData: (prev: PagedResult<NotificationPersist> | undefined) =>
      prev,
    staleTime: 60_000,
    enabled,
  });
}


export function useNotificationActions(opts?: {
  onLocalMarkAll?: () => void;
  onLocalMarkOne?: (id: string) => void;
  onLocalReset?: () => void;
}) {
  const qc = useQueryClient();

  const invalidateLists = async () => {
    await qc.invalidateQueries({ queryKey: qkNotifications.lists() });
  };

  const markOneRead = async (id: IdLike) => {
    const snapshot = qc.getQueriesData<PagedResult<NotificationPersist>>({
      queryKey: qkNotifications.lists(),
    });

    // ✅ optimista
    qc.setQueriesData(
      { queryKey: qkNotifications.lists() },
      (old: PagedResult<NotificationPersist> | undefined) => {
        if (!old) return old;
        const now = nowIsoDate();
        return {
          ...old,
          items: old.items.map((x) =>
            isSameId(x.NotificationId, id)
              ? { ...x, ReadAt: x.ReadAt ?? now }
              : x,
          ),
        };
      },
    );

    opts?.onLocalMarkOne?.(String(id));

    try {
      await markNotificationRead(Number(id));
    } catch (e) {
      // rollback
      for (const [key, data] of snapshot) qc.setQueryData(key, data);
      throw e;
    } finally {
      await invalidateLists();
    }
  };

  const markAllRead = async () => {
    const snapshot = qc.getQueriesData<PagedResult<NotificationPersist>>({
      queryKey: qkNotifications.lists(),
    });

    // ✅ optimista
    qc.setQueriesData(
      { queryKey: qkNotifications.lists() },
      (old: PagedResult<NotificationPersist> | undefined) => {
        if (!old) return old;
        const now = nowIsoDate();
        return {
          ...old,
          items: old.items.map((x) => ({ ...x, ReadAt: x.ReadAt ?? now })),
        };
      },
    );

    opts?.onLocalMarkAll?.();

    try {
      await markAllNotificationsRead();
    } catch (e) {
      // rollback
      for (const [key, data] of snapshot) qc.setQueryData(key, data);
      throw e;
    } finally {
      await invalidateLists();
    }
  };

  const clearCache = () => {
    qc.removeQueries({ queryKey: qkNotifications.lists() });
    opts?.onLocalReset?.();
  };

  return {
    markOneRead,
    markAllRead,
    invalidateLists,
    clearCache,
  };
}