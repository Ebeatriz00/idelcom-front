import { LOGIN_LOCK_KEY, SESSION_FLAG_KEY } from "./constants";
import { readSessionProfile } from "./session-profile";
import type { AuthState } from "./types";

export function getInitialAuthState(): AuthState {
  const sessionProfile = readSessionProfile();
  const businessId = localStorage.getItem("businessId");
  const userId = localStorage.getItem("userId");
  const authFlag = localStorage.getItem(SESSION_FLAG_KEY);
  const hasAuthData = authFlag === "true" && !!businessId && !!userId;
  const lockRaw = localStorage.getItem(LOGIN_LOCK_KEY);
  const lockStored = lockRaw ? Number(lockRaw) : 0;
  const lockExpired = lockStored && Date.now() >= lockStored;
  const lockUntil = lockExpired ? 0 : lockStored;

  if (lockExpired) {
    localStorage.removeItem(LOGIN_LOCK_KEY);
  }

  return {
    businessId,
    businessName: sessionProfile.businessName,
    token: hasAuthData ? "http-only" : null,
    refreshToken: hasAuthData ? "http-only" : null,
    userId,
    workerId: localStorage.getItem("workerId") ?? "",
    userName: sessionProfile.userName,
    profile: sessionProfile.profile,
    profilesId: localStorage.getItem("profilesId"),
    userPhoto: sessionProfile.userPhoto,
    areasId: localStorage.getItem("areasId"),
    usersVisibiliyId: localStorage.getItem("usersVisibiliyId"),
    loading: false,
    isAuthenticated: hasAuthData,
    error: null,
    lockUntil,
    locked: false,
    lockReason: undefined,
    sessionNonce: 0,
  };
}
