import { useEffect, useRef } from "react";
import { Columns } from "lucide-react";
import type { Table } from "@tanstack/react-table";

type ColumnsMenuProps<T> = {
  table: Table<T>;
  /** IDs de columnas a excluir del menú */
  exclude?: string[];
  /** Texto del botón/summary */
  label?: string;
  /** Ancho del popover (ej. "w-52") */
  menuWidthClass?: string;
  /** Resolver opcional para el label de cada columna */
  getColumnLabel?: (col: ReturnType<Table<T>["getAllLeafColumns"]>[number]) => string;
};

export function ColumnsMenu<T>({
  table,
  exclude = ["actions", "select"],
  label = "Columnas",
  menuWidthClass = "w-52",
  getColumnLabel,
}: ColumnsMenuProps<T>) {
  const rootRef = useRef<HTMLDetailsElement>(null);

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

  const cols = table
    .getAllLeafColumns()
    .filter((c) => !exclude.includes(c.id));

  return (
    <details ref={rootRef} className="relative">
      <summary className="list-none inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 cursor-pointer">
        <Columns className="size-3.5" /> {label}
      </summary>

      <div
        className={`absolute right-0 mt-1 ${menuWidthClass} rounded-xl border border-gray-200 bg-white shadow p-2 z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {cols.map((col) => {
          const resolved =
            getColumnLabel?.(col) ??
            (col.columnDef as any)?.meta?.label ??
            (typeof col.columnDef.header === "string"
              ? col.columnDef.header
              : col.id);

          return (
            <label
              key={col.id}
              className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded hover:bg-gray-50"
              title={resolved}
            >
              <span className="truncate">{resolved}</span>
              <input
                type="checkbox"
                checked={col.getIsVisible()}
                onChange={col.getToggleVisibilityHandler()}
              />
            </label>
          );
        })}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
            onClick={() =>
              table.getAllLeafColumns().forEach((c) => c.toggleVisibility(true))
            }
          >
            Mostrar todo
          </button>
          <button
            type="button"
            className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
            onClick={() =>
              table.getAllLeafColumns().forEach((c) => c.toggleVisibility(false))
            }
          >
            Ocultar todo
          </button>
        </div>
      </div>
    </details>
  );
}
