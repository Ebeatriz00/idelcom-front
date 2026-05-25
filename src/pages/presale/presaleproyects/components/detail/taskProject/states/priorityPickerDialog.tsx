import type { PriorityStateSelectDto } from "@/application"; 
import { Ban, Check, Flag } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  options: PriorityStateSelectDto[];
  valueId?: string | null;
  onSelect: (opt: PriorityStateSelectDto | null) => void;
  onClose: () => void;
  title?: string;
  width?: number;
  includeClear?: boolean;
};

export default function PriorityPickerDialog({
  open,
  anchorEl,
  options,
  valueId,
  onSelect,
  onClose,
  title = "Prioridad de tarea",
  width = 280,
  includeClear = true,
}: Props) {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, {
        capture: true,
      } as any);
    };
  }, [open, onClose, anchorEl]);

  const place = () => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const top = rect.bottom + 8;
    let left = rect.left;
    const maxLeft = window.innerWidth - width - 12;
    if (left > maxLeft) left = Math.max(12, maxLeft);
    setCoords({ top: Math.max(12, top), left });
  };
  useLayoutEffect(() => {
    if (open) place();
  }, [open, anchorEl, width]);
  useEffect(() => {
    if (!open) return;
    const h = () => place();
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("scroll", h, true);
      window.removeEventListener("resize", h);
    };
  }, [open]);

  const withClear = useMemo(() => {
    const base = options ?? [];
    if (!includeClear) return base;
    return [
      ...base,
      {
        linkToken: "clear",
        priorityDesc: "Borrar",
        color: "bg-gray-300",
      },
    ];
  }, [options, includeClear]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? withClear.filter((o) => o.priorityDesc.toLowerCase().includes(q))
      : withClear;
  }, [withClear, query]);

  if (!open || !anchorEl) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[200] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
      style={{ top: coords.top, left: coords.left, width }}
    >
      <div className="px-3 pt-3">
        <div className="text-[13px] font-semibold text-gray-800 px-1">
          {title}
        </div>
        <div className="mt-2 mb-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <ul className="max-h-[320px] overflow-auto p-1">
        {filtered.map((opt) => {
          const isClear = opt.priorityDesc === "Borrar";
          const active = isClear ? valueId == null : opt.linkToken === valueId;

          return (
            <li key={opt.linkToken} className="px-1 py-0.5">
              <button
                type="button"
                onClick={() => onSelect(isClear ? null : opt)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  "hover:bg-gray-100",
                  active && "bg-gray-100"
                )}
              >
                {isClear ? (
                  <Ban className="size-4 text-gray-500 shrink-0" />
                ) : (
                  <span
                    className={cn(
                      "flex items-center justify-center size-5 rounded-md shrink-0",
                      (opt as any).color 
                    )}
                  >
                    <Flag className="size-3.5 text-white" />
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm truncate",
                    isClear ? "text-gray-700" : "text-gray-800",
                    active && "font-semibold"
                  )}
                >
                  {opt.priorityDesc}
                </span>

                {active && <Check className="size-4 text-gray-700 ml-auto" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body
  );
}