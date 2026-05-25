export const AUTH_SESSION_PROFILE_KEYS = {
  businessName: "auth:session:businessName",
  userName: "auth:session:userName",
  profile: "auth:session:profile",
  userPhoto: "auth:session:userPhoto",
} as const;

export type SessionProfile = {
  businessName?: string | null;
  userName?: string | null;
  profile?: string | null;
  userPhoto?: string | null;
};

function readProfileValue(key: string) {
  const localValue = localStorage.getItem(key);
  if (localValue != null && localValue !== "") {
    return localValue;
  }

  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue != null && sessionValue !== "") {
    localStorage.setItem(key, sessionValue);
    return sessionValue;
  }

  return null;
}

export function readSessionProfile(): Required<SessionProfile> {
  try {
    return {
      businessName: readProfileValue(AUTH_SESSION_PROFILE_KEYS.businessName),
      userName: readProfileValue(AUTH_SESSION_PROFILE_KEYS.userName),
      profile: readProfileValue(AUTH_SESSION_PROFILE_KEYS.profile),
      userPhoto: readProfileValue(AUTH_SESSION_PROFILE_KEYS.userPhoto),
    };
  } catch {
    return {
      businessName: null,
      userName: null,
      profile: null,
      userPhoto: null,
    };
  }
}

export function persistSessionProfile(profile: SessionProfile) {
  try {
    const entries: Array<[string, string | null | undefined]> = [
      [AUTH_SESSION_PROFILE_KEYS.businessName, profile.businessName],
      [AUTH_SESSION_PROFILE_KEYS.userName, profile.userName],
      [AUTH_SESSION_PROFILE_KEYS.profile, profile.profile],
      [AUTH_SESSION_PROFILE_KEYS.userPhoto, profile.userPhoto],
    ];

    entries.forEach(([key, value]) => {
      if (value == null || value === "") {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    });
  } catch {
    return;
  }
}

export function clearSessionProfile() {
  try {
    Object.values(AUTH_SESSION_PROFILE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch {
    return;
  }
}
