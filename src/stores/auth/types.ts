export type LockReason =
  | "expired"
  | "manual"
  | "inactivity"
  | "refresh_failed"
  | "server_down"
  | "cross_tab"
  | "signalr_unauthorized"
  | "auth_failed"
  | "signalr_auth_failed";

export type AuthState = {
  businessId: string | null;
  workerId?: string;
  businessName: string | null;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  userPhoto: string | null;
  profile: string | null;
  profilesId: string | null;
  areasId: string | null;
  usersVisibiliyId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lockUntil: number;
  locked: boolean;
  lockReason?: LockReason;
  sessionNonce: number;
};

export type AuthActions = {
  clearError: () => void;
  login: (payload: any) => Promise<void>;
  reauth: (password: string) => Promise<boolean>;
  lock: (reason?: LockReason) => void;
  unlock: () => void;
  logout: () => void;
  expireToken: (reason?: LockReason) => void;
  refreshAccessToken: () => Promise<void>;
  setBusinessId?: (id: string | null) => void;
  setBusinessName?: (businessName: string | null) => void;
};

export type AuthStore = AuthState & AuthActions;
export function normalizePhotoUrl(photo?: string | null) {
  if (!photo) return null;
  const url = photo.trim();
  const v = Date.now();
  return url.includes("?") ? `${url}&v=${v}` : `${url}?v=${v}`;
}
