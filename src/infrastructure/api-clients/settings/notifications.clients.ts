// notifications.clients.ts
import type { NotificationPersist } from "@/application";
import http from "@/infrastructure";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchNotificationsList(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PagedResult<NotificationPersist>> {
  const uid = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());

  const { page = 1, pageSize = 30, search = "" } = params ?? {};

  const { data } = await http.get<
    | ApiEnvelope<PagedResult<NotificationPersist>>
    | PagedResult<NotificationPersist>
  >("/Notifications/ListNotifications", {
    params: {
      usersId: uid,
      businessId: bid,
      page,
      pageSize,
      search: search || undefined,
    },
  });

  return unwrap<PagedResult<NotificationPersist>>(data);
}

export async function fetchNotificationsForDropdown(
  top: number = 10,
): Promise<NotificationPersist[]> {
  const uid = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());

  // page 1, pageSize = top
  const { data } = await http.get<
    | ApiEnvelope<PagedResult<NotificationPersist>>
    | PagedResult<NotificationPersist>
  >("/Notifications/ListNotifications", {
    params: {
      usersId: uid,
      businessId: bid,
      page: 1,
      pageSize: top,
    },
  });

  const result = unwrap<PagedResult<NotificationPersist>>(data);
  return result.items;
}

export async function markAllNotificationsRead() {
  const usersId = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());
  return http.put("/Notifications/MarkAllRead", { businessId: bid, usersId });
}

export async function markNotificationRead(id: number) {
  const uid = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());

  return http.put("/Notifications/MarkRead", {
    businessId: bid,
    usersId: uid,
    notificationId: id,
  });
}

export async function alertResolve(notificationsId: number) {
  const uid = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());

  return http.put("/Notifications/AlertResolve", null, {
    params: {
      businessId: bid,
      usersId: uid,
      notificationId: notificationsId,
    },
  });
}

export async function alertSnooze(
  notificationsId: number,
  snoozeUntil: Date,
  comment: string,
) {
  const uid = Number(getUserIdFromtStorage());
  const bid = Number(getBusinessIdFromStorage());

  return http.put("/Notifications/AlertSnooze", null, {
    params: {
      businessId: bid,
      usersId: uid,
      notificationId: notificationsId,
      snoozeUntil: snoozeUntil.toISOString(),
      comment,
    },
  });
}
