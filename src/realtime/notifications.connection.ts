import { CacheDomains } from "@/cache/dimains";
import { markBackendDown } from "@/interceptors/network.interceptor";
import { queryClient } from "@/queryClient";
import { useAuth } from "@/stores/auth";
import * as signalR from "@microsoft/signalr";

let instance: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let manualStop = false;
let authErrorCount = 0;
const MAX_AUTH_ERRORS = 3;
let handlersWired = false;

async function recoverSignalRAuthFailure(context: string) {
  const state = useAuth.getState();

  if (!state.isAuthenticated || state.locked) {
    return;
  }

  try {
    console.warn(`[WS] ${context}. Intentando refrescar sesion antes de expirar.`);
    await state.refreshAccessToken?.();
    authErrorCount = 0;
  } catch (error) {
    console.error("[WS] No se pudo recuperar la sesion desde SignalR", error);
    state.expireToken?.("signalr_auth_failed");
  }
}

function shouldInvalidate(payload: any) {
  if (payload?.code === "CACHE_INVALIDATE") return true;
  if (payload?.type === "cache_invalidate") return true;
  if (payload?.item === "cache_invalidate") return true;

  return false;
}

function onNotify(payload: any) {
  if (!shouldInvalidate(payload)) return;

  const keys: string[] = payload.keys ?? [];

  return Promise.all([
    keys.includes("preSales")
      ? queryClient.invalidateQueries({ queryKey: CacheDomains.preSales })
      : Promise.resolve(),
    keys.includes("hirings")
      ? queryClient.invalidateQueries({ queryKey: CacheDomains.hirings })
      : Promise.resolve(),
    keys.includes("opportunities")
      ? queryClient.invalidateQueries({ queryKey: CacheDomains.opportunities })
      : Promise.resolve(),
    keys.includes("dashboard")
      ? queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      : Promise.resolve(),
  ]).then(() => console.log("[WS] invalidacion completada"));
}

function wireHandlers(c: signalR.HubConnection) {
  if (handlersWired) return;
  handlersWired = true;

  c.off("notify", onNotify);
  c.on("notify", onNotify);
}

export function getNotificationsConn() {
  if (!instance) {
    instance = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/hubs/notifications`, {
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const retryCount = retryContext.previousRetryCount;
          if (retryCount > 2) {
            console.log("[WS] Maximos reintentos alcanzados, deteniendo");
            return null;
          }
          return Math.min(retryCount * 1000, 5000);
        },
      })
      .build();

    instance.onclose((err) => {
      if (manualStop) return;

      const msg = String(err?.message ?? "");
      console.warn("[WS] Conexion cerrada:", msg.substring(0, 200));

      const isAuthError =
        msg.includes("401") ||
        msg.includes("Unauthorized") ||
        msg.includes("Usuario No Autorizado");

      if (isAuthError) {
        authErrorCount++;
        console.warn(`[WS] Error de auth #${authErrorCount}`);

        if (authErrorCount >= MAX_AUTH_ERRORS) {
          console.error("[WS] Maximos errores de auth alcanzados.");
          void recoverSignalRAuthFailure(
            "Maximos errores de auth en cierre de conexion",
          );
        }
        return;
      }

      authErrorCount = 0;

      const isServerDown =
        msg.includes("WebSocket closed with status code: 1006") ||
        msg.includes("Failed to fetch") ||
        msg.includes("net::ERR_CONNECTION_REFUSED");

      if (isServerDown) {
        console.warn("[WS] Backend caido (onclose), marcando backend-down");
        markBackendDown();
      }
    });

    instance.onreconnected(() => {
      authErrorCount = 0;
      console.log("[WS] Reconectado - reset auth errors");
    });
  }

  return instance;
}

export function ensureNotificationsStarted() {
  const authState = useAuth.getState();

  if (!authState.isAuthenticated || authState.locked) {
    console.log("[WS] No iniciar conexion - usuario no autenticado/bloqueado");
    return Promise.resolve();
  }

  const c = getNotificationsConn();
  wireHandlers(c);

  console.log("[WS] state antes start:", c.state);

  if (manualStop) return Promise.resolve();

  const state = c.state;
  if (
    state === signalR.HubConnectionState.Connected ||
    state === signalR.HubConnectionState.Connecting ||
    state === signalR.HubConnectionState.Reconnecting
  ) {
    return startPromise ?? Promise.resolve();
  }

  if (!startPromise) {
    startPromise = c
      .start()
      .then(() => {
        authErrorCount = 0;
        console.log("[WS] Conectado");
      })
      .catch(async (err: any) => {
        const msg = String(err?.message ?? "");

        if (
          err?.name === "AbortError" ||
          msg.includes("The connection was stopped during negotiation")
        ) {
          console.debug("[WS] Conexion abortada durante negociacion");
          return;
        }

        if (msg.includes("401") || msg.includes("Unauthorized")) {
          authErrorCount++;
          console.error("[WS] Error 401 en inicio - No autorizado");

          if (authErrorCount >= MAX_AUTH_ERRORS) {
            await recoverSignalRAuthFailure("SignalR devolvio 401 al iniciar");
          }
          throw err;
        }

        if (
          msg.includes("Failed to fetch") ||
          msg.includes("ERR_CONNECTION_REFUSED") ||
          msg.includes("status code: 1006")
        ) {
          console.warn("[WS] Error de red en inicio - marcando backend down");
          markBackendDown();
          throw err;
        }

        console.error("[WS] Error al iniciar conexion:", err);
        throw err;
      })
      .finally(() => {
        startPromise = null;
      });
  }

  return startPromise;
}

export async function stopNotificationsConn() {
  if (!instance) return;

  manualStop = true;
  authErrorCount = 0;

  try {
    if (instance.state !== signalR.HubConnectionState.Disconnected) {
      await instance.stop();
      console.log("[WS] Conexion detenida manualmente");
    }
  } finally {
    instance = null;
    startPromise = null;
    manualStop = false;
    handlersWired = false;
  }
}

export function resetSignalRAuth() {
  authErrorCount = 0;
  manualStop = false;
}
