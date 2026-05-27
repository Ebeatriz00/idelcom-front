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
  const expireToken = useAuth((s) => s.expireToken);

  const onLockRef = useRef(onLock);
  const isLocking = useRef(false);
  const refreshUnauthorizedCount = useRef(0);

  useEffect(() => {
    onLockRef.current = onLock;
  }, [onLock]);

  useEffect(() => {
    if (isLoading || isLocking.current) return;

    if (isManualLock) {
      return;
    }

    if (!isBackendAvailable()) {
      return;
    }

    if (!hasConfirmedSession) {
      return;
    }

    if (!authenticated) {
      isLocking.current = true;

      void (async () => {
        try {
          await refreshAccessToken();
          await refetch();
        } catch (error) {
          if (!isUnauthorizedError(error) && import.meta.env.DEV) {
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

    const timer = window.setTimeout(async () => {
      const state = useAuth.getState();
      const nowManual = state.locked && state.lockReason === "manual";
      if (nowManual) {
        return;
      }

      try {
        await refreshAccessToken();
        await refetch();
        refreshUnauthorizedCount.current = 0;
      } catch (e) {
        if (isUnauthorizedError(e)) {
          refreshUnauthorizedCount.current += 1;

          const sessionCheck = await refetch().catch(() => null);
          if (sessionCheck?.data?.authenticated) {
            return;
          }
        } else if (import.meta.env.DEV) {
          console.error("[AuthGuard] Error en refresh token:", e);
        }

        if (!isBackendAvailable()) {
          return;
        }

        const stateAfterError = useAuth.getState();
        const nowManual2 =
          stateAfterError.locked && stateAfterError.lockReason === "manual";
        if (nowManual2) {
          return;
        }

        if (!isLocking.current) {
          isLocking.current = true;
          expireToken(isUnauthorizedError(e) ? "refresh_failed" : "expired");
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

  useEffect(() => {
    if (!authenticated || isManualLock) return;

    const refreshIfNeeded = async () => {
      if (!isBackendAvailable()) return;

      const state = useAuth.getState();
      if (!state.isAuthenticated || state.locked) return;

      try {
        await refreshAccessToken();
        await refetch();
        refreshUnauthorizedCount.current = 0;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          expireToken("refresh_failed");
          return;
        }

        if (import.meta.env.DEV) {
          console.error("[AuthGuard] Error en refresh preventivo:", error);
        }
      }
    };

    const onFocus = () => {
      if (secondsLeft <= refreshSkewSeconds + 30) {
        void refreshIfNeeded();
      }
    };

    const onVisibility = () => {
      if (!document.hidden) onFocus();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", refreshIfNeeded);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", refreshIfNeeded);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    authenticated,
    isManualLock,
    secondsLeft,
    refreshSkewSeconds,
    refreshAccessToken,
    refetch,
    expireToken,
  ]);

  return { session, authenticated, secondsLeft, isLoading };
}
