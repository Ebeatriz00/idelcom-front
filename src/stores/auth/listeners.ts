import { AUTH_SYNC_KEY, SESSION_FLAG_KEY, STORAGE_GUARD_FLAG } from "./constants";
import { persistSessionProfile, readSessionProfile } from "./session-profile";
import type { AuthStore } from "./types";

type SetState = (
  updater: Partial<AuthStore> | ((state: AuthStore) => Partial<AuthStore>),
) => void;

export function bindCrossTabStorageLogout(
  get: () => AuthStore,
  set: SetState,
) {
  if (typeof window === "undefined") return;

  const w = window as any;

  if (w[STORAGE_GUARD_FLAG]) return;
  w[STORAGE_GUARD_FLAG] = true;

  window.addEventListener("storage", (e: StorageEvent) => {
    const state = get();
    if (e.key === SESSION_FLAG_KEY && !e.newValue && state.isAuthenticated) {
      const { expireToken, lock } = state;

      if (typeof expireToken === "function") {
        // logout/exp expirado disparado desde otra tab
        expireToken("cross_tab");
      } else if (typeof lock === "function") {
        lock("cross_tab");
      }
      return;
    }

    if (e.key !== AUTH_SYNC_KEY || !e.newValue) return;

    try {
      const payload = JSON.parse(e.newValue) as {
        type?: string;
        businessName?: string | null;
        userName?: string | null;
        profile?: string | null;
        userPhoto?: string | null;
      };
      if (payload.type !== "authenticated") return;

      const userId = localStorage.getItem("userId");
      const businessId = localStorage.getItem("businessId");

      if (!userId || !businessId) return;

      persistSessionProfile({
        businessName: payload.businessName,
        userName: payload.userName,
        profile: payload.profile,
        userPhoto: payload.userPhoto,
      });
      const sessionProfile = readSessionProfile();

      set((s) => ({
        ...s,
        businessId,
        businessName: sessionProfile.businessName,
        token: "http-only",
        refreshToken: "http-only",
        userId,
        userName: sessionProfile.userName,
        profile: sessionProfile.profile,
        workerId: localStorage.getItem("workerId") ?? "",
        profilesId: localStorage.getItem("profilesId"),
        userPhoto: sessionProfile.userPhoto,
        areasId: localStorage.getItem("areasId"),
        usersVisibiliyId: localStorage.getItem("usersVisibiliyId"),
        isAuthenticated: true,
        locked: false,
        lockReason: undefined,
        error: null,
        sessionNonce: (s.sessionNonce ?? 0) + 1,
      }));
      window.dispatchEvent(new CustomEvent("auth:login_success"));
    } catch {
      return;
    }
  });
}
