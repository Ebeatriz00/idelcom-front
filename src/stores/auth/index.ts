import { create } from "zustand";
import { createAuthActions } from "./actions";
import { getInitialAuthState } from "./initial-state";
import { bindCrossTabStorageLogout } from "./listeners";
import type { AuthStore } from "./types";

export const useAuth = create<AuthStore>()((set, get) => ({
  ...getInitialAuthState(),
  ...createAuthActions(set as any, get),
}));

/*const initial = useAuth.getState();
if (initial.isAuthenticated || initial.locked) {
  scheduleLockOnExpiry(useAuth.getState);
}*/
bindCrossTabStorageLogout(useAuth.getState, useAuth.setState);
