function decode(token: string) {
  const [, p] = token.split(".");
  return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
}

export function tokenMatchesSession(
  token: string,
  expectedUserId?: string | null,
  expectedBusinessId?: string | null
) {
  try {
    const payload = decode(token);
    const okUser = expectedUserId
      ? String(payload.sub) === String(expectedUserId)
      : true;
    const okBid = expectedBusinessId
      ? String(payload.bid ?? payload.bid) === String(expectedBusinessId)
      : true;
    return okUser && okBid;
  } catch {
    return false;
  }
}
