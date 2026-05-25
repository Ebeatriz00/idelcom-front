import { isBackendAvailable } from "@/interceptors/network.interceptor";
import { useAuthSession } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useEffect, useRef } from "react";

type Options = {
  onLock: () => void;
  refreshSkewSeconds?: number;
};

function isUnauthorizedError(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status === 401;
}

export function useAuthGuard({ onLock, refreshSkewSeconds = 60 }: Options) {
  const {
    session,
    authenticated,
    secondsLeft,
    refetch,
    isLoading,
    hasConfirmedSession,
  } = useAuthSession();

  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);
  const isManualLock = locked && lockReason === "manual";
  const refreshAccessToken = useAuth((s) => s.refreshAccessToken);
  const logout = useAuth((s) => s.logout);

  const onLockRef = useRef(onLock);
  const isLocking = useRef(false);

  useEffect(() => {
    onLockRef.current = onLock;
  }, [onLock]);

  useEffect(() => {
    if (isLoading || isLocking.current) return;

    if (isManualLock) {
      console.log("[AuthGuard] Lock manual activo, no bloqueo ni refresco");
      return;
    }

    if (!isBackendAvailable()) {
      console.log("[AuthGuard] Backend caido, no bloqueo por auth");
      return;
    }

    if (!hasConfirmedSession) {
      console.log("[AuthGuard] Estado de sesion no confirmado, no bloqueo");
      return;
    }

    if (!authenticated) {
      console.log("[AuthGuard] Usuario no autenticado, intentando refresh");
      isLocking.current = true;

      void (async () => {
        try {
          await refreshAccessToken();
          await refetch();
        } catch (error) {
          if (isUnauthorizedError(error)) {
            console.warn("[AuthGuard] Sesion expirada, cerrando estado local");
          } else {
            console.error("[AuthGuard] No se pudo recuperar la sesion:", error);
          }
          await logout();
        } finally {
          setTimeout(() => {
            isLocking.current = false;
          }, 1000);
        }
      })();

      return;
    }

    const fireIn = Math.max(5, secondsLeft - refreshSkewSeconds);
    console.log(`[AuthGuard] Programando refresh en ${fireIn} segundos`);

    const timer = window.setTimeout(async () => {
      const state = useAuth.getState();
      const nowManual = state.locked && state.lockReason === "manual";
      if (nowManual) {
        console.log("[AuthGuard] Se activo lock manual, cancelo refresh");
        return;
      }

      try {
        console.log("[AuthGuard] Ejecutando refresh token...");
        await refreshAccessToken();
        await refetch();
        console.log("[AuthGuard] Refresh token exitoso");
      } catch (e) {
        if (isUnauthorizedError(e)) {
          console.warn("[AuthGuard] Refresh no autorizado, cerrando sesion");
        } else {
          console.error("[AuthGuard] Error en refresh token:", e);
        }

        if (!isBackendAvailable()) {
          console.log(
            "[AuthGuard] Error de refresh pero backend caido, no bloqueo sesion",
          );
          return;
        }

        const stateAfterError = useAuth.getState();
        const nowManual2 =
          stateAfterError.locked && stateAfterError.lockReason === "manual";
        if (nowManual2) {
          console.log("[AuthGuard] Lock manual activo, no bloqueo por refresh");
          return;
        }

        if (!isLocking.current) {
          isLocking.current = true;
          await logout();
          setTimeout(() => {
            isLocking.current = false;
          }, 1000);
        }
      }
    }, fireIn * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    authenticated,
    secondsLeft,
    refreshSkewSeconds,
    isLoading,
    hasConfirmedSession,
    refetch,
    isManualLock,
    refreshAccessToken,
    logout,
  ]);

  return { session, authenticated, secondsLeft, isLoading };
}
