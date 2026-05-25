
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { StateTaskSelectDto } from "@/application";

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;                  
  options: StateTaskSelectDto[];
  valueId?: string | null;                      
  onSelect: (opt: StateTaskSelectDto) => void;
  onClose: () => void;
  title?: string;
  width?: number;                                
};

export default function StatusPickerDialog({
    open,
  anchorEl,
  options,
  valueId,
  onSelect,
  onClose,
  title = "Estado",
  width = 300,
}: Props) {
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
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
      window.removeEventListener("pointerdown", onDown, { capture: true } as any);
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
  useLayoutEffect(() => { if (open) place(); }, [open, anchorEl, width]);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.stateDesc.toLowerCase().includes(q)) : options;
  }, [options, query]);

  if (!open || !anchorEl) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[200] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
      style={{ top: coords.top, left: coords.left, width }}
      // permitir scroll del fondo: NO overlay, NO pointer-events globales
    >
      {/* Header + buscador */}
      <div className="px-3 pt-3">
        <div className="text-[13px] font-semibold text-gray-800 px-1">{title}</div>
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

      {/* Lista */}
      <ul className="max-h-[280px] overflow-auto p-1">
        {filtered.map((opt) => {
          const active = opt.lineToken === valueId;
          return (
            <li key={opt.lineToken} className="px-1 py-0.5">
              <button
                type="button"
                onClick={() => onSelect(opt)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 text-left",
                  active && "bg-gray-100"
                )}
              >
                <span className={cn("size-2.5 rounded-full shrink-0", opt.stateColor)} />
                <span className={cn("text-sm text-gray-800 truncate", active && "font-semibold")}>
                  {opt.stateDesc}
                </span>
                {!!opt.numPercPro && (
                  <span className="ml-auto text-xs text-gray-500">{opt.numPercPro}%</span>
                )}
                {active && <Check className="size-4 text-gray-700 ml-1" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body
  );
}