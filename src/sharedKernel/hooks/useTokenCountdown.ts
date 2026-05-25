import { useAuthSession } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useEffect, useMemo, useRef, useState } from "react";

export function useSessionCountdown() {
  const { authenticated, secondsLeft } = useAuthSession();
  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);

  const [remainingMs, setRemainingMs] = useState(
    () => Math.max(secondsLeft, 0) * 1000
  );
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // siempre limpia antes
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // si está bloqueado o no autenticado: contador 0 y bye
    if (locked || !authenticated) {
      setRemainingMs(0);
      return;
    }

    // arranca desde lo que venga del backend/token
    setRemainingMs(Math.max(secondsLeft, 0) * 1000);

    intervalRef.current = window.setInterval(() => {
      setRemainingMs((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [authenticated, locked, secondsLeft]);

  const expiresAt = useMemo(() => {
    if (locked || !authenticated) return null;
    return remainingMs > 0 ? Date.now() + remainingMs : null;
  }, [authenticated, locked, remainingMs]);

  return {
    remainingMs,
    expiresAt,
    locked,
    lockReason,
    hasValidSession: authenticated && !locked && remainingMs > 0,
  };
}
