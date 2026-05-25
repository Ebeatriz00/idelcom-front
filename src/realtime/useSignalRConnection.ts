import { isBackendAvailable, markBackendDown } from "@/interceptors/network.interceptor";
import {
  ensureNotificationsStarted,
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
      console.log("[WS] Deteniendo conexion SignalR");
      stopNotificationsConn();
      connectionAttempts.current = 0;
      return;
    }

    if (!isBackendAvailable()) {
      console.log("[WS] Backend no disponible, no intentar conexion");
      markBackendDown();
      return;
    }

    console.log("[WS] Iniciando conexion SignalR...");
    connectionAttempts.current = 0;

    const attemptConnection = () => {
      if (connectionAttempts.current >= maxAttempts) {
        console.warn("[WS] Maximos intentos de conexion alcanzados");
        markBackendDown();
        return;
      }

      connectionAttempts.current++;

      ensureNotificationsStarted().catch((err) => {
        const msg = String(err?.message || "");

        if (
          msg.includes("Failed to fetch") ||
          msg.includes("ERR_CONNECTION_REFUSED") ||
          msg.includes("status code: 1006")
        ) {
          console.log(
            `[WS] Intento ${connectionAttempts.current}/${maxAttempts} fallido (backend caido)`,
          );

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
          console.warn("[WS] SignalR no autorizado, intentando refrescar sesion");
          refreshAccessToken().catch(() => {
            expireToken?.("signalr_auth_failed");
          });
          return;
        }

        console.error("[WS] Error inesperado en SignalR:", err);
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
