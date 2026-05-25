import { useNotificationsStore } from "@/stores/notifications/notifications.store";
import type { UINotificationItem } from "@/stores/notifications/useNotificationListUI";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Portal } from "../../Portal";

function toLocalDatetimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function parseLocalDatetimeInputValue(v: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  if (!m) return null;

  const [, yy, MM, dd, hh, mm] = m;
  const d = new Date(
    Number(yy),
    Number(MM) - 1,
    Number(dd),
    Number(hh),
    Number(mm),
    0,
    0,
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

export function SnoozeModal({
  open,
  onOpenChange,
  notification,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notification: UINotificationItem;
}) {
  const snooze = useNotificationsStore((s) => s.snooze);

  const minMinutes = 5;

  const defaultValue = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    return toLocalDatetimeInputValue(d);
  }, []);

  const [untilStr, setUntilStr] = useState(defaultValue);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const validate = () => {
    const until = parseLocalDatetimeInputValue(untilStr);
    if (!until) return "Fecha inválida.";

    const now = new Date();
    const min = new Date(now.getTime() + minMinutes * 60_000);
    if (until < min) {
      return `La fecha debe ser al menos ${minMinutes} min después de ahora.`;
    }

    //console.log(notification.slaMaxAt);
    if (notification.slaMaxAt) {
      const slaMax = new Date(notification.slaMaxAt);

      if (isNaN(slaMax.getTime())) {
        return "Fecha SLA inválida (formato).";
      }

      if (until > slaMax) {
        return `No puedes posponer más allá del ${slaMax.toLocaleString()}.`;
      }
    }
    return null;
  };

  const onSubmit = async () => {
    const msg = validate();
    setError(msg);
    if (msg) return;

    const until = parseLocalDatetimeInputValue(untilStr)!;

    try {
      setSaving(true);

      await snooze(notification.id, until, note.trim() || undefined);

      onOpenChange(false);
      setNote("");
      setError(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[999999] grid place-items-center bg-gray-400/30 p-4"
        onMouseDown={() => onOpenChange(false)}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Posponer
              </div>
              <div className="text-xs text-slate-500 truncate max-w-[320px]">
                {notification.title}
              </div>
            </div>

            <button
              className="rounded-md p-2 hover:bg-slate-100"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">
                Nueva fecha y hora
              </span>
              <input
                type="datetime-local"
                value={untilStr}
                onChange={(e) => setUntilStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Mínimo: {minMinutes} minutos desde ahora.
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-700">
                Comentario
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                required
                placeholder="Ej: esperando respuesta del cliente / falta info / etc."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-[12px] text-rose-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
            <button
              className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              type="button"
            >
              Cancelar
            </button>

            <button
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={onSubmit}
              disabled={saving}
              type="button"
            >
              {saving ? "Guardando..." : "Posponer"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
