import { fetchAuthBootstrap, fetchAuthSession } from "@/infrastructure";
import { useAuth } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuthBootstrap() {
  const usersId = useAuth((s) => s.userId);
  const businessId = useAuth((s) => s.businessId);

  return useQuery({
    queryKey: ["auth", "bootstrap", usersId, businessId],
    queryFn: fetchAuthBootstrap,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAuthSession() {
  const userId = useAuth((s) => s.userId);
  const businessId = useAuth((s) => s.businessId);
  const sessionNonce = useAuth((s) => s.sessionNonce);

  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);

  const isManualLock = locked && lockReason === "manual";

  const query = useQuery({
    queryKey: ["auth", "session", userId, businessId, sessionNonce],
    queryFn: fetchAuthSession,
    enabled: !!userId && !!businessId && !isManualLock,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: undefined,
  });

  const session = query.data;
  const hasConfirmedSession = isManualLock || query.isSuccess;
  const authenticated = isManualLock ? false : session?.authenticated ?? false;
  const secondsLeft = isManualLock ? 0 : session?.remainingSeconds ?? 0;

  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setExpiresAtMs(null);
      return;
    }

    if (session?.expiresAt) {
      const ms = new Date(session.expiresAt).getTime();
      setExpiresAtMs(
        Number.isFinite(ms) ? ms : Date.now() + secondsLeft * 1000,
      );
      return;
    }

    setExpiresAtMs(Date.now() + Math.max(secondsLeft, 0) * 1000);
  }, [authenticated, session?.expiresAt, secondsLeft]);

  return {
    ...query,
    session,
    hasConfirmedSession,
    authenticated,
    secondsLeft,
    expiresAtMs,
    isExpiringSoon: authenticated && secondsLeft <= 60,
    isLocked: locked,
    lockReason,
  };
}
