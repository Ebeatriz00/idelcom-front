import { useAuthSession } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useEffect, useMemo, useRef, useState } from "react";

export function useSessionCountdown() {
  const { authenticated, expiresAtMs } = useAuthSession();
  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);

  const [remainingMs, setRemainingMs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (locked || !authenticated || !expiresAtMs) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
       setRemainingMs(Math.max(expiresAtMs - Date.now(), 0));
    };

    tick(); // ✅ actualiza inmediato (sin esperar 1s)

    intervalRef.current = window.setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [authenticated, locked, expiresAtMs]);

  const expiresAt = useMemo(() => {
    if (locked || !authenticated || !expiresAtMs) return null;
    return expiresAtMs;
  }, [authenticated, locked, expiresAtMs]);

  return {
    remainingMs,
    expiresAt,
    locked,
    lockReason,
    hasValidSession: authenticated && !locked && remainingMs > 0,
  };
}
