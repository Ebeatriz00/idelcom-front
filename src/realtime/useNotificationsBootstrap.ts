// useNotificationsBootstrap.ts
import { fetchNotificationsForDropdown } from "@/infrastructure/api-clients/settings/notifications.clients";
import { useAuth } from "@/stores/auth";
import {
  useNotificationsStore,
  type NotificationItem,
} from "@/stores/notifications/notifications.store";
import { useEffect } from "react";
import { normalizeNotification } from "./normalizeNotification";
import { useSignalRConnection } from "./useSignalRConnection";

const isNotif = (x: NotificationItem | null): x is NotificationItem =>
  x !== null;

export function useNotificationsBootstrap() {
  const isAuth = useAuth((s) => s.isAuthenticated);
  const setList = useNotificationsStore((s) => s.setList);

  useSignalRConnection();

  useEffect(() => {
    if (!isAuth) return;

    let alive = true;

    async function load() {
      try {
        const list = await fetchNotificationsForDropdown(30);

        const normalized = (list ?? [])
          .map(normalizeNotification)
          .filter(isNotif);

        if (!alive) return;

        setList(normalized); 
      } catch (err) {
        console.error("Error cargando notificaciones:", err);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [isAuth, setList]);
}
