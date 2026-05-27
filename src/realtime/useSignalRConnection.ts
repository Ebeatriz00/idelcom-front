import { isBackendAvailable, markBackendDown } from "@/interceptors/network.interceptor";
import {
  ensureNotificationsStarted,
  hasNotificationsConn,
  stopNotificationsConn,
} from "@/realtime/notifications.connection";
import { useAuth } from "@/stores/auth";
import { useEffect, useRef } from "react";

export function useSignalRConnection() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const refreshAccessToken = useAuth((s) => s.refreshAccessToken);
  const expireToken = useAuth((s) => s.expireToken);
  const connectionAttempts = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const maxAttempts = 3;

  useEffect(() => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (!isAuthenticated) {
      if (hasNotificationsConn()) {
        stopNotificationsConn();
      }
      connectionAttempts.current = 0;
      return;
    }

    if (!isBackendAvailable()) {
      markBackendDown();
      return;
    }

    connectionAttempts.current = 0;

    const attemptConnection = () => {
      if (connectionAttempts.current >= maxAttempts) {
        markBackendDown();
        return;
      }

      connectionAttempts.current++;

      ensureNotificationsStarted().catch((err: unknown) => {
        const msg = String((err as { message?: string })?.message || "");

        if (
          msg.includes("Failed to fetch") ||
          msg.includes("ERR_CONNECTION_REFUSED") ||
          msg.includes("status code: 1006")
        ) {
          markBackendDown();

          if (connectionAttempts.current < maxAttempts) {
            retryTimerRef.current = window.setTimeout(attemptConnection, 5000);
          }
          return;
        }

        if (
          msg.includes("401") ||
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("forbidden")
        ) {
          refreshAccessToken()
            .then(() => ensureNotificationsStarted())
            .catch(() => {
              expireToken?.("signalr_auth_failed");
            });
          return;
        }

        if (import.meta.env.DEV) {
          console.error("[WS] Error inesperado en SignalR:", err);
        }
      });
    };

    attemptConnection();

    return () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isAuthenticated, expireToken, refreshAccessToken]);
}
