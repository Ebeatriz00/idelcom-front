import type { UINotificationItem } from "@/stores/notifications/useNotificationListUI";
import { Check, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SnoozeModal } from "./modal/SnoozeModal";
import { useNotificationsStore } from "@/stores/notifications/notifications.store";
function hasAction(item: UINotificationItem, a: "SNOOZE" | "RESOLVE") {
  return (item.actions ?? []).includes(a);
}

export function DropdownItem({ item }: { item: UINotificationItem }) {
  const navigate = useNavigate();
  const resolve = useNotificationsStore((s) => s.resolve);
  const [openSnooze, setOpenSnooze] = useState(false);

  const canSnooze = hasAction(item, "SNOOZE");
  const canResolve = hasAction(item, "RESOLVE");
  const showFooter = canSnooze || canResolve;

  const go = () => {
    if (item.linkUrl) navigate(item.linkUrl);
  };

  return (
    <>
      <div className="bg-white">
        {/* CONTENT */}
        <div
          onClick={go}
          className="px-4 py-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium text-slate-800">
              {item.title}
            </p>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {item.timeLabel}
            </span>
          </div>

          {item.message && (
            <p className="mt-1 text-[12px] text-slate-600 leading-snug">
              {item.message}
            </p>
          )}
        </div>

        {/* FOOTER SOLO SI HAY ACCIONES */}
        {showFooter && (
          <>
            <div className="border-t border-slate-200" />
            <div className="px-3 py-2 flex items-center gap-2 bg-slate-50">
              {canSnooze && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSnooze(true);
                  }}
                  className="
                    inline-flex items-center gap-1.5 rounded-md
                    border border-slate-200 bg-white
                    px-2.5 py-1.5 text-[12px] font-medium text-slate-700
                    hover:bg-slate-100
                  "
                >
                  <Clock className="size-4" />
                  Posponer
                </button>
              )}

              {canResolve && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resolve(item.id);
                  }}
                  className="
                    inline-flex items-center gap-1.5 rounded-md
                    border border-emerald-200 bg-emerald-50
                    px-2.5 py-1.5 text-[12px] font-semibold text-emerald-700
                    hover:bg-emerald-100
                  "
                >
                  <Check className="size-4" />
                  Resuelto
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {canSnooze && (
        <SnoozeModal
          open={openSnooze}
          onOpenChange={setOpenSnooze}
          notification={item}
        />
      )}
    </>
  );
}