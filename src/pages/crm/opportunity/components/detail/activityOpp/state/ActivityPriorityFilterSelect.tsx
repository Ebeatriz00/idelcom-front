import type { PriorityStateSelectDto } from "@/application";
import { cn } from "@/sharedKernel";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ActivityPriorityFilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: PriorityStateSelectDto[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  function ColorDot({ color }: { color?: string | null }) {
    if (!color) {
      return <span className="size-2.5 rounded-full shrink-0 bg-gray-300" />;
    }
    const c = color.trim();
    const isHexOrRgb =
      c.startsWith("#") || c.startsWith("rgb(") || c.startsWith("hsl(");

    return isHexOrRgb ? (
      <span
        className="size-2.5 rounded-full shrink-0 border border-gray-200"
        style={{ backgroundColor: c }}
      />
    ) : (
      <span className={cn("size-2.5 rounded-full shrink-0", c)} />
    );
  }

  const selected = (value ?? "").trim() || "Todos";
  const current = options.find((o) => o.priorityDesc === selected);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm flex items-center justify-between gap-2 hover:bg-gray-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          {current ? <ColorDot color={current.color} /> : <ColorDot />}
          <span className="truncate">{current?.priorityDesc ?? "Todos"}</span>
        </span>
        {open ? (
          <ChevronUp className="size-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-gray-500 shrink-0" />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 w-full rounded-xl bg-white shadow-lg ring-1 ring-black/5 max-h-72 overflow-auto p-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opción "Todos" fija */}
          <button
            role="option"
            aria-selected={selected === "Todos"}
            onClick={() => {
              onChange("Todos");
              setOpen(false);
            }}
            className={cn(
              "w-full text-left rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50",
              selected === "Todos" && "bg-gray-50 font-medium"
            )}
          >
            <ColorDot />
            <span>Todos</span>
          </button>

          {options.map((opt) => {
            const active = selected === opt.priorityDesc;
            return (
              <button
                key={opt.linkToken ?? opt.priorityDesc}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.priorityDesc);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50",
                  active && "bg-gray-50 font-medium"
                )}
              >
                <ColorDot color={opt.color} />
                <span className="truncate">{opt.priorityDesc}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
