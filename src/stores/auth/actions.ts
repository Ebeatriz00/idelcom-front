import { clearAppCache } from "@/cache/clearAppCache";
import {
  fetchAuthLogin,
  fetchAuthLogout,
  fetchAuthRefresh,
} from "@/infrastructure";
import {
  resetSignalRAuth,
  stopNotificationsConn,
} from "@/realtime/notifications.connection";
import { clearPersistedNotifications } from "@/stores/notifications/notifications.store";
import { parseApiError } from "@shared/alerts/apiErros";
import {
  AUTH_SYNC_KEY,
  LOGIN_ID_KEY,
  LOGIN_LOCK_KEY,
  SESSION_FLAG_KEY,
} from "@stores/auth/constants";
import {
  clearSessionProfile,
  persistSessionProfile,
} from "@stores/auth/session-profile";
import { clearExpiryTimer } from "@stores/auth/timers";
import type { AuthActions, AuthStore } from "@stores/auth/types";

export function createAuthActions(
  set: (p: Partial<AuthStore> | ((s: AuthStore) => Partial<AuthStore>)) => void,
  get: () => AuthStore,
): AuthActions {
  const processLoginResponse = async (resp: any, payload?: any) => {
    const userId = resp.usersId != null ? String(resp.usersId) : null;
    const workerId = resp.workerId ?? null;
    const businessId = resp.businessId != null ? String(resp.businessId) : null;
    const businessName = resp.businessName;
    const userName = resp.usersName ?? null;
    const profile = resp.profilesName ?? null;
    const profilesId = resp.profilesId ?? null;
    const userPhoto = resp.usersPhotho ?? null;
    const areasId = resp.areasId ?? null;
    const usersVisibiliyId = resp.usersVisibiliyId ?? null;

    if (!userId || !businessId) {
      throw new Error("Datos de usuario incompletos en la respuesta.");
    }

    if (payload?.usersKey) {
      localStorage.setItem(LOGIN_ID_KEY, payload.usersKey);
      localStorage.setItem("auth:lock_login_id", payload.usersKey);
    }

    localStorage.setItem("businessId", businessId);
    localStorage.setItem("userId", userId);
    if (workerId) localStorage.setItem("workerId", workerId);
    if (profilesId) localStorage.setItem("profilesId", profilesId);
    if (areasId) localStorage.setItem("areasId", areasId);
    if (usersVisibiliyId)
      localStorage.setItem("usersVisibiliyId", usersVisibiliyId);
    persistSessionProfile({
      businessName,
      userName,
      profile,
      userPhoto,
    });

    localStorage.setItem(SESSION_FLAG_KEY, "true");
    localStorage.setItem(
      AUTH_SYNC_KEY,
      JSON.stringify({
        type: "authenticated",
        at: Date.now(),
        businessName,
        userName,
        profile,
        userPhoto,
      }),
    );

    resetSignalRAuth();

    set((s) => ({
      ...s,
      businessId,
      businessName,
      token: "http-only",
      refreshToken: "http-only",
      userId,
      userName,
      profile,
      profilesId,
      workerId,
      userPhoto,
      areasId,
      usersVisibiliyId,
      isAuthenticated: true,
      locked: false,
      lockReason: undefined,
      error: null,
      sessionNonce: (s.sessionNonce ?? 0) + 1,
    }));
    window.dispatchEvent(new CustomEvent("auth:login_success"));
  };

  const clearAuthData = () => {
    const items = [
      "businessId",
      "userId",
      "workerId",
      "profilesId",
      "areasId",
      "usersVisibiliyId",
      SESSION_FLAG_KEY,
      "auth:lock_login_id",
      LOGIN_LOCK_KEY,
      LOGIN_ID_KEY,
    ];
    items.forEach((item) => localStorage.removeItem(item));
    clearSessionProfile();
  };
  const shouldRespectManualLock = () => {
    const s = get();
    return s.locked && s.lockReason === "manual";
  };

  return {
    clearError() {
      set({ error: null });
    },

    async login(payload: any) {
      const { lockUntil } = get();
      if (lockUntil && Date.now() < lockUntil) {
        const remaining = lockUntil - Date.now();
        const mins = Math.ceil(remaining / 60000);
        const err = {
          topCode: "AUTH_LOCKED_OUT",
          message: `Bloqueado. Intenta en ~${mins} min.`,
          retryUntil: lockUntil,
          retryAfterMs: remaining,
        };
        set({ error: err.message });
        throw err;
      }

      set({ loading: true, error: null });

      try {
        const resp = await fetchAuthLogin(payload);
        await processLoginResponse(resp, payload);
      } catch (e: any) {
        const parsed = parseApiError(e);
        if (parsed.topCode === "AUTH_LOCKED_OUT") {
          const until =
            parsed.retryUntil ??
            Date.now() + (parsed.retryAfterMs ?? 5 * 60 * 1000);
          localStorage.setItem(LOGIN_LOCK_KEY, String(until));
          set({ lockUntil: until });
        }
        set({ error: parsed.message, isAuthenticated: false });
        throw parsed;
      } finally {
        set({ loading: false });
      }
    },

    async reauth(password: string) {
      let loginId = localStorage.getItem("auth:lock_login_id");

      if (!loginId) {
        loginId = localStorage.getItem(LOGIN_ID_KEY);
      }

      if (!loginId) return false;

      set({ loading: true, error: null });

      try {
        const payload = { usersKey: loginId, usersPassword: password };
        const resp = await fetchAuthLogin(payload);
        await processLoginResponse(resp, payload);
        return true;
      } catch (e: any) {
        const parsed = parseApiError(e);
        set({ error: parsed.message });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    async refreshAccessToken(): Promise<void> {
      try {
        await fetchAuthRefresh();
        resetSignalRAuth();
        set({
          isAuthenticated: true,
          locked: false,
        });
      } catch (error: any) {
        const parsed = parseApiError(error);
        if (
          parsed.topCode === "REFRESH_TOKEN_EXPIRED" ||
          parsed.topCode === "REFRESH_TOKEN_INVALID"
        ) {
          get().expireToken("refresh_failed");
        }
        throw error;
      }
    },

    lock(reason) {
      if (shouldRespectManualLock()) return;

      const finalReason = reason ?? "manual";

      clearExpiryTimer();
      stopNotificationsConn();
      clearPersistedNotifications();

      window.dispatchEvent(
        new CustomEvent("auth:locked", {
          detail: { reason: finalReason },
        }),
      );

      set({
        locked: true,
        lockReason: finalReason,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
      });
    },

    unlock() {
      const state = get();

      // El desbloqueo debe pasar por reautenticacion y no por un toggle local.
      if (!state.isAuthenticated || state.locked) return;

      set({ locked: false, lockReason: undefined });
    },

    async logout() {
      await stopNotificationsConn();
      clearExpiryTimer();
      try {
        await fetchAuthLogout();
      } catch (e) {
        console.warn("Error durante logout:", e);
      }

      await clearAppCache();
      clearPersistedNotifications();

      clearAuthData();

      set((s) => ({
        ...s,
        token: null,
        refreshToken: null,
        userId: null,
        userName: null,
        profile: null,
        workerId: "",
        profilesId: null,
        businessId: null,
        businessName: null,
        areasId: null,
        usersVisibiliyId: null,
        isAuthenticated: false,
        error: null,
        lockUntil: 0,
        locked: false,
        lockReason: undefined,
        sessionNonce: (s.sessionNonce ?? 0) + 1,
      }));
    },

    expireToken(reason = "expired") {
      if (shouldRespectManualLock()) return;

      clearExpiryTimer();
      stopNotificationsConn();
      localStorage.removeItem(SESSION_FLAG_KEY);
      localStorage.setItem(
        AUTH_SYNC_KEY,
        JSON.stringify({ type: "expired", reason, at: Date.now() }),
      );
      clearAppCache();
      clearPersistedNotifications();

      set({
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        locked: true,
        lockReason: reason,
        error: null,
      });
    },
  };
}
