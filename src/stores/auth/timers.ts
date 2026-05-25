// stores/auth/timers.ts
let tokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;

export function clearExpiryTimer() {
  if (tokenExpiryTimer) {
    clearTimeout(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }
}
