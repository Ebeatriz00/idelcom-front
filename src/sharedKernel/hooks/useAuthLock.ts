import { useEffect } from "react";
import { useAuth } from "@/stores/auth";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthLock() {
  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (locked) {
      console.log("[useAuthLock] Bloqueo detectado, invalidando cache de sesión");
      
      // Invalidar la query de sesión inmediatamente
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      
      // También podrías cancelar queries pendientes
      queryClient.cancelQueries({ queryKey: ["auth", "session"] });
      
      // Forzar una nueva fetch si es necesario
      setTimeout(() => {
        queryClient.resetQueries({ queryKey: ["auth", "session"] });
      }, 100);
      
      // Disparar un evento personalizado para otros componentes
      window.dispatchEvent(new CustomEvent('auth:session-invalidated'));
    }
  }, [locked, lockReason, queryClient]);

  return { locked, lockReason };
}