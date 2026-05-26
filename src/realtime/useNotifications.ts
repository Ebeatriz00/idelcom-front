import {
  ensureNotificationsStarted,
  getNotificationsConn,
} from "@/realtime/notifications.connection";
import { useAuth } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications/notifications.store";
import { useEffect } from "react";
import { toast } from "sonner";
import { isEmailToast } from "./isEmailToast";
import { normalizeNotification } from "./normalizeNotification";
import { getEventKeyNormalized, type NotifyPayload } from "./NotifyPayload";

function normalizeWsPayload(raw: any) {
  let p = typeof raw === "string" ? safeJson(raw) : raw;
  p = p?.payload ?? p?.notification ?? p;
  return p;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function shouldProcessNotification(payload: any, userId: number): boolean {
  if (isEmailToast(payload)) {
    return true;
  }

  if (payload.targetUserId !== undefined) {
    return Number(payload.targetUserId) === userId;
  }

  if (payload.usersId !== undefined) {
    return Number(payload.usersId) === userId;
  }

  return true;
}

export function useNotifications() {
  const addNotification = useNotificationsStore((s) => s.add);
  const isAuth = useAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuth) return;

    const conn = getNotificationsConn();
    const userId = Number(useAuth.getState().userId);

    const processOne = (p: NotifyPayload) => {
      const key = getEventKeyNormalized(p);

      if (isEmailToast(p)) {
        const msg = (p as any).message ?? "Correo procesado";

        if (key === "EMAIL_SENT") {
          toast.success(msg);
        } else {
          toast.error(msg);
        }
        return;
      }

      const norm = normalizeNotification(p);
      if (!norm) return;
      addNotification(norm);
    };

    const handler = (raw: any) => {
      const payload = normalizeWsPayload(raw);

      if (!shouldProcessNotification(payload, userId)) {
        return;
      }

      if (Array.isArray(payload)) {
        payload.forEach((p) => {
          processOne(p);
        });
      } else {
        processOne(payload);
      }
    };

    conn.off("notify", handler);
    conn.on("notify", handler);

    ensureNotificationsStarted().catch((err: unknown) => {
      console.debug("[WS] Inicio diferido omitido:", err);
    });

    return () => conn.off("notify", handler);
  }, [isAuth, addNotification]);
}
