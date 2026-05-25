import type { OptionItem } from "@/application";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ProductFilterSelectProps = {
  label: string;
  placeholder: string;
  value?: number;
  options: OptionItem[];
  onChange: (value?: number) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function ProductFilterSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
  loading,
}: ProductFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative flex min-w-[210px] flex-1 flex-col gap-1 sm:max-w-[260px]"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          if (disabled || loading) return;
          setOpen((current) => !current);
        }}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-secondary/10 bg-white px-3 text-left text-sm font-medium text-secondary outline-none transition hover:border-primary/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground"
      >
        <span className={selected ? "text-secondary" : "text-slate-400"}>
          {loading ? "Cargando..." : selected?.label || placeholder}
        </span>
        <span className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange(undefined);
                setQuery("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(undefined);
                  setQuery("");
                }
              }}
              className="inline-flex size-5 items-center justify-center rounded-md text-slate-400 transition hover:bg-muted hover:text-secondary"
              aria-label={`Limpiar ${label}`}
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown className="size-4 text-slate-400" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[66px] z-30 overflow-hidden rounded-xl border border-secondary/10 bg-white shadow-[0_18px_45px_-22px_rgba(15,23,42,0.45)]">
          <div className="border-b border-secondary/10 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Buscar ${label.toLowerCase()}...`}
                className="h-9 w-full rounded-lg border border-secondary/10 bg-muted/40 pl-8 pr-3 text-sm font-medium text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-primary-degrad/40 hover:text-secondary"
            >
              <span className="size-4" />
              {placeholder}
            </button>

            {filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-secondary transition hover:bg-primary-degrad/40"
                >
                  {isSelected ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <span className="size-4" />
                  )}
                  <span className="whitespace-normal">{option.label}</span>
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-500">
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
