import type { OptionItem } from "@/application";
import { Check } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  options: OptionItem[];
  valueId?: number | string | null;
  onSelect: (opt: OptionItem) => void;
  onClose: () => void;
  title?: string;
  width?: number;
};

export function TimelineStatePickerDialog({
  open,
  anchorEl,
  options,
  valueId,
  onSelect,
  onClose,
  title = "Cambiar Estado",
  width = 280,
}: Props) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [internalQuery, setInternalQuery] = useState("");

  const place = () => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    
    const top = rect.bottom + window.scrollY + 6;
    let left = rect.left + window.scrollX;
    
    const maxLeft = window.innerWidth - width - 12;
    if (left > maxLeft) left = Math.max(12, maxLeft);
    
    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (open && anchorEl) {
      place();
    } else {
      setCoords(null);
      setInternalQuery("");
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const handleEvents = () => place();
    window.addEventListener("scroll", handleEvents, { passive: true });
    window.addEventListener("resize", handleEvents);
    return () => {
      window.removeEventListener("scroll", handleEvents);
      window.removeEventListener("resize", handleEvents);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      if (anchorEl?.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener("pointerdown", onDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onDown, { capture: true } as any);
  }, [open, onClose, anchorEl]);

  const filtered = useMemo(() => {
    const q = internalQuery.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, internalQuery]);

  if (!open || !anchorEl || !coords) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        "fixed z-[9999] flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5",
        "animate-in fade-in zoom-in-95 duration-150 ease-out origin-top"
      )}
      style={{ 
        top: coords.top, 
        left: coords.left, 
        width,
        opacity: coords.top === 0 ? 0 : 1 
      }}
    >
      <div className="bg-gray-50/50 p-3 pb-2">
        <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {title}
        </div>
        <input
          autoFocus
          value={internalQuery}
          onChange={(e) => setInternalQuery(e.target.value)}
          placeholder="Buscar estado..."
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-auto p-1 max-h-[250px]">
        <ul className="space-y-0.5">
          {filtered.map((opt) => {
            const active = String(opt.value) === String(valueId);
            const color = (opt as any).stateColor || "#94a3b8";
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left transition-colors",
                    active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
                    style={{ backgroundColor: color }}
                  />
                  <span className={cn("flex-1 truncate text-[11px]", active && "font-semibold")}>
                    {opt.label}
                  </span>
                  {active && <Check className="size-3 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
}