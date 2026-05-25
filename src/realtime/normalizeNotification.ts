import type {
  NotificationItem,
  NotificationKind,
} from "@/stores/notifications/notifications.store";

function safeDate(d: any) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function mapKindFromDb(entity: string, module: string): NotificationKind {
  const e = String(entity ?? "")
    .trim()
    .toUpperCase();
  const m = String(module ?? "")
    .trim()
    .toUpperCase();

  if (e === "OPPORTUNITY_ALERT") return "alert";
  if (e === "OPPORTUNITY") return "opportunity";
  if (m === "CRM") return "system";

  return "generic";
}

export function normalizeNotification(n: any): NotificationItem | null {
  const code = String(n?.code ?? n?.payload?.code ?? "").toUpperCase();

  // 🚫 Eventos técnicos: NO son notificación
  if (code === "CACHE_INVALIDATE") return null;

  const notificationId = n.notificationId ?? n.NotificationId;
  const isDb = notificationId !== undefined;

  const id =
    isDb && notificationId > 0 ? String(notificationId) : crypto.randomUUID();

  const rawDate = n.createdAt ?? n.CreatedAt;
  const dt = safeDate(rawDate);
  const createdAtIso = dt ? dt.toISOString() : new Date().toISOString();

  const title = n.title ?? n.Title ?? "";
  const message = n.message ?? n.Message ?? "";
  const linkUrl = n.linkUrl ?? n.LinkUrl ?? "";

  const entity = n.entity ?? n.Entity ?? "";
  const module = n.module ?? n.Module ?? "";

  const actorName = n.createdByName ?? n.CreatedByName ?? "Sistema";

  return {
    id,
    kind: mapKindFromDb(entity, module),
    level: "info",
    actorName,
    actorAvatar: n.avatar ?? null,
    target: title,
    message,
    createdAt: createdAtIso,
    read: isDb ? (n.readAt ?? n.ReadAt) != null : false,
    payload: n,
    linkUrl,
  };
}
