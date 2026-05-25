// TokenCountdown.tsx
import { useSessionCountdown } from "@/sharedKernel/hooks/security/useSessionCountdown";
import { Clock, Lock } from "lucide-react";
import { useMemo } from "react";

export default function TokenCountdown({ 
  collapsed = false 
}: { 
  collapsed?: boolean 
}) {
  const { remainingMs, locked, lockReason } = useSessionCountdown();
  const totalSec = useMemo(
    () => Math.max(Math.ceil(remainingMs / 1000), 0),
    [remainingMs]
  );
  
  const tone = useMemo(() => {
    if (locked) return "locked";
    if (totalSec <= 120) return "danger";
    if (totalSec <= 600) return "warn";
    return "ok";
  }, [locked, totalSec]);
  
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  
  const label = useMemo(() => 
    `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    [hh, mm, ss]
  );
  
  const dotColor = useMemo(() => {
    switch(tone) {
      case "ok": return "bg-emerald-500";
      case "warn": return "bg-amber-500";
      case "danger": return "bg-rose-600";
      case "locked": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  }, [tone]);

  if (locked) {
    const lockDisplayText = lockReason === "manual" ? "Manual" : 
                           lockReason === "inactivity" ? "Inactivo" : 
                           lockReason || "Bloqueado";
    
    if (collapsed) {
      return (
        <div
          className="flex items-center justify-center py-2"
          title={`Sesión bloqueada (${lockDisplayText}) - Click para desbloquear`}
        >
          <div className="relative">
            <Lock className="size-5 text-gray-400" />
            <span className={`absolute -right-1 -top-1 inline-block size-2 rounded-full ${dotColor}`} />
          </div>
        </div>
      );
    }
    
    return (
      <div
        className="px-3 py-2"
        title={`Sesión bloqueada (${lockDisplayText}) - Click para desbloquear`}
      >
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Lock className="size-4" />
            <span>Bloqueado</span>
          </div>
          <div className="text-xs text-gray-500">
            {lockDisplayText}
          </div>
        </div>
      </div>
    );
  }
  
  // Caso 2: No hay sesión activa (tiempo = 0)
  if (totalSec <= 0) {
    if (collapsed) {
      return (
        <div
          className="flex items-center justify-center py-2"
          title="Sesión inactiva"
        >
          <div className="relative">
            <Clock className="size-5 text-gray-300" />
            <span className="absolute -right-1 -top-1 inline-block size-2 rounded-full bg-gray-300" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="px-3 py-2" title="Sesión inactiva">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block size-2 rounded-full bg-gray-300" />
            <span>Sesión</span>
          </div>
          <div className="font-mono text-sm font-semibold tabular-nums text-gray-400">
            00:00:00
          </div>
        </div>
      </div>
    );
  }
  
  const title = `Sesión activa - Expira en ${label}`;
  
  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center py-2"
        title={title}
      >
        <div className="relative">
          <Clock className="size-5 text-gray-600" />
          <span className={`absolute -right-1 -top-1 inline-block size-2 rounded-full ${dotColor}`} />
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="px-3 py-2"
      title={title}
    >
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className={`inline-block size-2 rounded-full ${dotColor}`} />
          <span>Sesión</span>
        </div>
        <div className="font-mono text-sm font-semibold tabular-nums">
          {label}
        </div>
      </div>
    </div>
  );
}
