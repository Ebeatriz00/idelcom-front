import {
  useNotificationsStore,
  type NotificationItem,
} from "@/stores/notifications/notifications.store";
import { useNotificationListUI } from "@/stores/notifications/useNotificationListUI";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownItem } from "./DropdownItem";

import { normalizeNotification } from "@/realtime/normalizeNotification";
import { useNotificationsList } from "@/sharedKernel/hooks/Notifications/useNotifications";

const isNotif = (x: NotificationItem | null): x is NotificationItem =>
  x !== null;

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);

  const unread = useNotificationsStore((s) => s.unread);

  const list = useNotificationListUI();
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  const { data, isSuccess } = useNotificationsList(0, 30, "");

  useEffect(() => {
    if (!isSuccess) return;

    const mapped = (data?.items ?? [])
      .map(normalizeNotification)
      .filter(isNotif);
    useNotificationsStore.setState({
      list: mapped,
      unread: mapped.filter((n) => !n.read && !n.isResolved).length,
    });
  }, [isSuccess]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={toggle}
        className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <div className="fixed right-2 top-14 w-[92vw] max-w-sm rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden z-[9999] md:absolute md:right-0 md:top-full md:mt-3 md:w-80">
          <div className="flex items-center justify-between px-4 py-3 bg-white">
            <span className="text-sm font-semibold text-slate-900">
              Notificaciones ({list.length})
            </span>

            {list.length > 0 && (
              <button
                className="text-xs font-medium text-primary px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary-700 transition-colors"
                onClick={() => navigate("Notifications/Notifications")}
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 bg-white">
            {list.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Sin notificaciones
              </div>
            ) : (
              list.map((n) => <DropdownItem key={n.id} item={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
