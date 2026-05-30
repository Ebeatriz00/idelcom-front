import { CacheDomains } from "@/cache/dimains";
import { markBackendDown } from "@/interceptors/network.interceptor";
import { queryClient } from "@/queryClient";
import { useAuth } from "@/stores/auth";
import * as signalR from "@microsoft/signalr";

let instance: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let manualStop = false;
let authErrorCount = 0;
let handlersWired = false;
let connectionEpoch = 0;

function isSignalRAuthError(message: string) {
  const normalized = message.toLowerCase();
  return (
    message.includes("401") ||
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden") ||
    message.includes("Usuario No Autorizado")
  );
}

async function recoverSignalRAuthFailure(context: string): Promise<boolean> {
  const state = useAuth.getState();

  if (!state.isAuthenticated || state.locked) {
    return false;
  }

  try {
    console.warn(`[WS] ${context}. Intentando refrescar sesion antes de expirar.`);
    await state.refreshAccessToken?.();
    authErrorCount = 0;
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[WS] No se pudo recuperar la sesion desde SignalR", error);
    }
    state.expireToken?.("signalr_auth_failed");
    return false;
  }
}

async function refreshAndRestartSignalR(context: string): Promise<void> {
  if (manualStop) return;

  const recovered = await recoverSignalRAuthFailure(context);
  if (!recovered || manualStop) return;

  const authState = useAuth.getState();
  if (!authState.isAuthenticated || authState.locked) return;

  startPromise = null;

  try {
    await ensureNotificationsStarted();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[WS] No se pudo reconectar SignalR despues del refresh", error);
    }
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
  ]);
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
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const retryCount = retryContext.previousRetryCount;
          if (retryCount > 2) {
            return null;
          }
          return Math.min(retryCount * 1000, 5000);
        },
      })
      .build();

    instance.onclose((err) => {
      if (manualStop) return;

      const msg = String(err?.message ?? "");

      if (isSignalRAuthError(msg)) {
        authErrorCount++;
        void refreshAndRestartSignalR("SignalR cerro por auth");
        return;
      }

      authErrorCount = 0;

      const isServerDown =
        msg.includes("WebSocket closed with status code: 1006") ||
        msg.includes("Failed to fetch") ||
        msg.includes("net::ERR_CONNECTION_REFUSED");

      if (isServerDown) {
        markBackendDown();
      }
    });

    instance.onreconnected(() => {
      authErrorCount = 0;
    });
  }

  return instance;
}

export function ensureNotificationsStarted(): Promise<void> {
  const authState = useAuth.getState();

  if (manualStop || !authState.isAuthenticated || authState.locked) {
    return Promise.resolve();
  }

  const c = getNotificationsConn();
  wireHandlers(c);
  const startEpoch = connectionEpoch;

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
      .then(async () => {
        const currentAuth = useAuth.getState();
        if (
          manualStop ||
          startEpoch !== connectionEpoch ||
          !currentAuth.isAuthenticated ||
          currentAuth.locked
        ) {
          await c.stop().catch(() => undefined);
          return;
        }

        authErrorCount = 0;
      })
      .catch(async (err: any) => {
        const msg = String(err?.message ?? "");

        if (
          err?.name === "AbortError" ||
          msg.includes("The connection was stopped during negotiation")
        ) {
          return;
        }

        if (isSignalRAuthError(msg)) {
          authErrorCount++;

          const recovered = await recoverSignalRAuthFailure(
            "SignalR devolvio 401 al iniciar",
          );
          if (recovered) {
            startPromise = null;
            return ensureNotificationsStarted();
          }

          throw err;
        }

        if (
          msg.includes("Failed to fetch") ||
          msg.includes("ERR_CONNECTION_REFUSED") ||
          msg.includes("status code: 1006")
        ) {
          markBackendDown();
          throw err;
        }

        if (import.meta.env.DEV) {
          console.error("[WS] Error al iniciar conexion:", err);
        }
        throw err;
      })
      .finally(() => {
        startPromise = null;
      });
  }

  return startPromise;
}

export function hasNotificationsConn() {
  return !!instance || !!startPromise;
}

export async function stopNotificationsConn() {
  manualStop = true;
  connectionEpoch++;
  authErrorCount = 0;
  startPromise = null;

  if (!instance) {
    handlersWired = false;
    return;
  }

  try {
    if (instance.state !== signalR.HubConnectionState.Disconnected) {
      await instance.stop();
    }
  } finally {
    instance = null;
    startPromise = null;
    handlersWired = false;
  }
}

export function resetSignalRAuth() {
  authErrorCount = 0;
  manualStop = false;
  connectionEpoch++;
}
