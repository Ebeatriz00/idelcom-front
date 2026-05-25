import type { AuthStore } from "./types";

export const selectBusinessId = (s: AuthStore) => s.businessId;
export const selectWorkerId = (s: AuthStore) => s.workerId;
export const selectToken = (s: AuthStore) => s.token;
export const selectIsAuth = (s: AuthStore) => s.isAuthenticated;
export const selectUserName = (s: AuthStore) => s.userName;
export const selectUserPhoto = (s: AuthStore) => s.userPhoto;
export const selectLocked = (s: AuthStore) => s.locked;
export const selectLockReason = (s: AuthStore) => s.lockReason;
export const selectLoading = (s: AuthStore) => s.loading;
export const selectError = (s: AuthStore) => s.error;

export const selectLogin = (s: AuthStore) => s.login;
export const selectReauth = (s: AuthStore) => s.reauth;
export const selectLogout = (s: AuthStore) => s.logout;
export const selectLock = (s: AuthStore) => s.lock;
export const selectUnlock = (s: AuthStore) => s.unlock;
export const selectClearError = (s: AuthStore) => s.clearError;
