export function getJwtExpMs(token?: string | null): number {
  if (!token) return 0;
  try {
    const [, payload] = token.split(".");
    if (!payload) return 0;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof json.exp === "number" ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function isJwtActive(token?: string | null): boolean {
  const expMs = getJwtExpMs(token);
  return expMs > Date.now();
}


