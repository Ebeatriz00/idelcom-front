import { useEffect, useRef } from "react";
import { useAuth } from "@/stores/auth";
import { selectToken } from "@/stores/auth/selectors";

export function useInactivityLock(timeoutMs = 10 * 60 * 1000) {
  const token = useAuth(selectToken);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;

    let disposed = false;

    const resetTimer = () => {
      if (disposed) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);

      try {
        localStorage.setItem("auth:lastActivity", String(Date.now()));
      } catch {
        // Ignore storage failures; inactivity lock should still work in-memory.
      }

      timerRef.current = window.setTimeout(() => {
        const { token: t, locked: l, lock } = useAuth.getState();
        if (t && !l) lock("inactivity");
      }, timeoutMs);
    };

    const onActivity = () => resetTimer();
    const onVisibility = () => {
      if (!document.hidden) resetTimer();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth:lastActivity") resetTimer();
    };

    resetTimer();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("mousedown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      disposed = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("scroll", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [token, timeoutMs]);
}
