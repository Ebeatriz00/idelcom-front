import { useNotificationsStore } from "@/stores/notifications/notifications.store";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type {
  NotificationKind,
  NotificationLevel,
} from "./notifications.store";

export type NotificationAction = "SNOOZE" | "RESOLVE";

export interface UINotificationItem {
  id: string;
  actorName: string;
  actorAvatar: string | null;
  title: string;
  message: string;
  timeLabel: string;
  read: boolean;
  kind: NotificationKind;
  level: NotificationLevel;
  createdAt: string;
  linkUrl: string;
  slaMaxAt?: string;
  actions: NotificationAction[];
}

function getActions(n: any): NotificationAction[] {
  const entity = String(n?.payload?.entity ?? n?.entity ?? "")
    .trim()
    .toUpperCase();

  if (entity === "OPPORTUNITY_ALERT") return ["SNOOZE", "RESOLVE"];

  return [];
}

export function useNotificationListUI(): UINotificationItem[] {
  const list = useNotificationsStore((s) => s.list);

  return list.map((n) => {
    let timeLabel = "";
    const slaMaxAt = n.payload?.finishDate ?? undefined;

    if (n.createdAt) {
      timeLabel = formatDistanceToNow(parseISO(n.createdAt), {
        addSuffix: true,
        locale: es,
      }).replace("alrededor de ", "");
    }

    return {
      id: n.id,
      actorName: n.actorName ?? "Sistema",
      actorAvatar: n.actorAvatar ?? null,
      title: n.target ?? n.message ?? "Notificación",
      message: n.message ?? "",
      timeLabel,
      read: n.read,
      kind: n.kind,
      level: n.level,
      createdAt: n.createdAt,
      linkUrl: n.linkUrl,
      slaMaxAt: slaMaxAt,
      actions: getActions(n),
    };
  });
}
