// src/realtime/mapPayloadToNotification.ts
import type { NotificationItem } from "@/stores/notifications/notifications.store";
import {
  getEventKey,
  isDbNotification,
  type NotifyPayload,
} from "./NotifyPayload";

export function mapPayloadToNotification(
  payload: NotifyPayload
): Omit<NotificationItem, "id" | "read"> {
  const createdAt = payload.createdAt ?? new Date().toISOString();
  const eventKey = getEventKey(payload);

  const actorName =
    (payload as any).createdByName ??
    (payload as any).assignerName ??
    "Sistema";

  const actorAvatar = (payload as any).avatar ?? null;

  switch (eventKey) {
    case "EMAIL_SENT":
      return {
        kind: "email",
        level: "success",
        actorName: "Sistema",
        actorAvatar: null,
        action: "envió un correo",
        target: (payload as any).message,
        createdAt,
        payload,
        linkUrl: (payload as any).linkUrl,
      };

    case "EMAIL_FAILED":
      return {
        kind: "email",
        level: "error",
        actorName: "Sistema",
        actorAvatar: null,
        action: "falló al enviar un correo",
        target: (payload as any).message,
        createdAt,
        payload,
        linkUrl: "",
      };

    case "NEW_COMMENT":
      return {
        kind: "new_comment",
        level: "info",
        actorName,
        actorAvatar,
        action: "comentó en",
        target: isDbNotification(payload)
          ? `Oportunidad #${payload.entityId}`
          : `Oportunidad #${(payload as any).OpporId}`,
        createdAt,
        payload,
        linkUrl: (payload as any).linkUrl,
      };

    case "OPPOR_UPDATED":
    case "OPPORTUNITY_UPDATED":
      return {
        kind: "opportunity",
        level: "info",
        actorName,
        actorAvatar: null,
        action: "actualizó",
        target: isDbNotification(payload)
          ? `Oportunidad #${payload.entityId}`
          : `Oportunidad #${(payload as any).OpporId}`,
        createdAt,
        payload,
        linkUrl: (payload as any).linkUrl,
      };

    case "CLIENT_REASSIGNED":
      return {
        kind: "system",
        level: "info",
        actorName,
        actorAvatar: null,
        action: "reasignó cliente",
        target:
          (payload as any).clientName ??
          (isDbNotification(payload) ? payload.message : "Cliente"),
        createdAt,
        payload,
        linkUrl: "",
      };

    case "SYSTEM_EVENT":
      return {
        kind: "system",
        level: "info",
        actorName: "Sistema",
        actorAvatar: null,
        message: (payload as any).message,
        createdAt,
        payload,
        linkUrl: "",
      };

    default:
      return {
        kind: "generic",
        level: "info",
        actorName,
        actorAvatar: null,
        message:
          (payload as any).message ??
          (isDbNotification(payload) ? payload.title : "Nueva notificación"),
        createdAt,
        payload,
        linkUrl: (payload as any).linkUrl,
      };
  }
}
