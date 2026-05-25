import { useAuth } from "./index";

function parseNumericIdentity(raw: string | null | undefined): number | null {
  if (!raw) return null;
  if (raw.includes(".") && raw.length > 20) {
    return null;
  }

  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function getAuthIdentityFromStore() {
  try {
    const state = useAuth.getState();
    return {
      businessId: parseNumericIdentity(state.businessId),
      userId: parseNumericIdentity(state.userId),
      profilesId: parseNumericIdentity(state.profilesId),
      areasId: parseNumericIdentity(state.areasId),
      usersVisibiliyId: parseNumericIdentity(state.usersVisibiliyId),
    };
  } catch {
    return {
      businessId: null,
      userId: null,
      profilesId: null,
      areasId: null,
      usersVisibiliyId: null,
    };
  }
}

export function getBusinessIdFromStorage(): number | null {
  try {
    const fromStore = getAuthIdentityFromStore().businessId;
    if (fromStore != null) return fromStore;

    const raw = localStorage.getItem("businessId");
    if (!raw) return null;
    if (raw.includes(".") && raw.length > 20) {
      console.warn(
        "[auth] businessId tiene formato de JWT, corrígelo en el login."
      );
      return null;
    }
    return parseNumericIdentity(raw);
  } catch {
    return null;
  }
}

export function getBusinessNameFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("businessName");
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}
export function getUserIdFromtStorage(): number | null {
  try {
    const fromStore = getAuthIdentityFromStore().userId;
    if (fromStore != null) return fromStore;

    const raw = localStorage.getItem("userId");
    if (!raw) return null;

    if (raw.includes(".") && raw.length > 20) {
      console.warn(
        "[auth] userId tiene formato de JWT, corrígelo en el login."
      );
      return null;
    }

    return parseNumericIdentity(raw);
  } catch {
    return null;
  }
}

export function getProfilesIdFromtStorage(): number | null {
  try {
    const fromStore = getAuthIdentityFromStore().profilesId;
    if (fromStore != null) return fromStore;

    const raw = localStorage.getItem("profilesId");
    if (!raw) return null;

    if (raw.includes(".") && raw.length > 20) {
      console.warn(
        "[auth] profilesId tiene formato de JWT, corrígelo en el login."
      );
      return null;
    }

    return parseNumericIdentity(raw);
  } catch {
    return null;
  }
}

export function getAreasIdFromtStorage(): number | null {
  try {
    const fromStore = getAuthIdentityFromStore().areasId;
    if (fromStore != null) return fromStore;

    const raw = localStorage.getItem("areasId");
    if (!raw) return null;

    if (raw.includes(".") && raw.length > 20) {
      console.warn(
        "[auth] profilesId tiene formato de JWT, corrígelo en el login."
      );
      return null;
    }

    return parseNumericIdentity(raw);
  } catch {
    return null;
  }
}
export function getUsersVisibilityIdFromtStorage(): number | null {
  try {
    const fromStore = getAuthIdentityFromStore().usersVisibiliyId;
    if (fromStore != null) return fromStore;

    const raw = localStorage.getItem("usersVisibiliyId");
    if (!raw) return null;

    if (raw.includes(".") && raw.length > 20) {
      console.warn(
        "[auth] profilesId tiene formato de JWT, corrígelo en el login."
      );
      return null;
    }

    return parseNumericIdentity(raw);
  } catch {
    return null;
  }
}
