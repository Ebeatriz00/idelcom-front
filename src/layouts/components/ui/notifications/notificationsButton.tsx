import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationsStore } from "@/stores/notifications/notifications.store";

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationsStore((s) => s.unread);
  const list = useNotificationsStore((s) => s.list);

  return (
    <div className="relative">
      {/* Botón */}
      

      <button
      onClick={() => setOpen((o) => !o)}
      className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
      aria-label="Notificaciones"
    >
      <Bell className="size-5" />

      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
          {unread}
        </span>
      )}
    </button>

      {/* Panel flotante de notificaciones */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-white shadow-lg p-3">
          <div className="mb-2 text-sm font-semibold">Notificaciones</div>

          {list.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              Sin notificaciones
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto space-y-2">
              {list.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg p-2 bg-gray-50 text-sm shadow-sm"
                >
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
