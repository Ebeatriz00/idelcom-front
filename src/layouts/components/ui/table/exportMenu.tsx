import { useEffect, useRef } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

type ExportFns<T> = {
  onCsv?: (rows: T[]) => void;
  onXlsx?: (rows: T[]) => void;
  onPdf?: (rows: T[]) => void;
};

type Props<T> = ExportFns<T> & {
  rows: T[];
  /** ancho opcional del popover */
  menuWidthClass?: string;
  /** texto del botón principal */
  label?: string;
  /** deshabilitar menú si no hay filas */
  disabledWhenEmpty?: boolean;
};

export function ExportMenu<T>({
  rows,
  onCsv,
  onXlsx,
  onPdf,
  menuWidthClass = "w-44",
  label = "Exportar",
  disabledWhenEmpty = true,
}: Props<T>) {
  const rootRef = useRef<HTMLDetailsElement>(null);
  const isEmpty = rows.length === 0;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = rootRef.current;
      if (!el?.open) return;
      if (el && !el.contains(e.target as Node)) el.open = false;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && rootRef.current?.open) rootRef.current.open = false;
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handle(fn?: (rows: T[]) => void) {
    if (!fn) return;
    fn(rows);
    if (rootRef.current) rootRef.current.open = false;
  }

  const disabled = disabledWhenEmpty && isEmpty;

  return (
    <details ref={rootRef} className="relative">
      <summary
        className={[
          "list-none inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
        ].join(" ")}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        <FileDown className="size-3.5" /> {label}
      </summary>

      <div
        className={`absolute right-0 mt-1 ${menuWidthClass} rounded-xl border border-gray-200 bg-white shadow p-2 z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {onCsv && (
          <button
            type="button"
            onClick={() => handle(onCsv)}
            className="w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50"
          >
            CSV <FileDown className="size-3.5" />
          </button>
        )}
        {onXlsx && (
          <button
            type="button"
            onClick={() => handle(onXlsx)}
            className="w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50"
          >
            Excel <FileSpreadsheet className="size-3.5" />
          </button>
        )}
        {onPdf && (
          <button
            type="button"
            onClick={() => handle(onPdf)}
            className="w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50"
          >
            PDF <FileText className="size-3.5" />
          </button>
        )}
      </div>
    </details>
  );
}
