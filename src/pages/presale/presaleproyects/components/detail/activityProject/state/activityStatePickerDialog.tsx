import type { ActivityStateSelectDto } from "@/application";
import { Check } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  options: ActivityStateSelectDto[];
  valueId?: string | null;
  onSelect: (opt: ActivityStateSelectDto) => void;
  onClose: () => void;
  title?: string;
  width?: number;
};

export default function ActivityStatePickerDialog({
  open,
  anchorEl,
  options,
  valueId,
  onSelect,
  onClose,
  title = "Estado",
  width = 300,
}: Props) {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  /* --------------------- cerrar con click afuera o escape --------------------- */
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

  /* ---------------------------- posicionamiento ---------------------------- */
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

  /* ------------------------------ búsqueda ------------------------------ */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.stateDesc.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  if (!open || !anchorEl) return null;

  /* -------------------------- Render del portal -------------------------- */
  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[200] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
      style={{ top: coords.top, left: coords.left, width }}
    >
      {/* Header + buscador */}
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

      {/* Lista */}
      <ul className="max-h-[280px] overflow-auto p-1">
        {filtered.map((opt, idx) => {
          const active = opt.linkToken === valueId;

          // fallback si no hay lineToken o es repetido
          const safeKey = opt.linkToken || `${opt.stateDesc}-${idx}`;

          const isHex = opt.stateColor?.startsWith("#");
          const circleStyle = isHex
            ? { backgroundColor: opt.stateColor! }
            : undefined;
          const circleClass = isHex ? "" : opt.stateColor || "bg-gray-300";

          return (
            <li key={safeKey} className="px-1 py-0.5">
              <button
                type="button"
                onClick={() => onSelect(opt)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 text-left transition-colors",
                  active && "bg-gray-100"
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full shrink-0 ring-1 ring-black/10",
                    circleClass
                  )}
                  style={circleStyle}
                />
                <span
                  className={cn(
                    "text-sm text-gray-800 truncate flex-1",
                    active && "font-semibold"
                  )}
                >
                  {opt.stateDesc}
                </span>
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
