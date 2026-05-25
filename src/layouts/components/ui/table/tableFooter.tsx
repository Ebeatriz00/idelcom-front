import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";

type Props<T> = {
  table: Table<T>;
  /** Total de registros (server-side). Si no se pasa, muestra solo las filas visibles. */
  total?: number | null;
  pageSize: number;
  setPageSize: (n: number) => void;
  /** Opciones del selector de tamaño de página */
  pageSizeOptions?: number[];
  /** Texto del label "Filas por página" */
  rowsPerPageLabel?: string;
  /** Slots opcionales para inyectar contenido extra */
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function TableFooter<T>({
  table,
  total = null,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50, 100],
  rowsPerPageLabel = "Filas por página",
  leftSlot,
  rightSlot,
}: Props<T>) {
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount() || 1;

  const visibleCount = table.getRowModel().rows.length;

  const start = pageIndex * pageSize + (visibleCount > 0 ? 1 : 0);
  const end = pageIndex * pageSize + visibleCount;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
      <div className="flex items-center gap-3">
        {/* Texto izquierda */}
        <div className="text-xs text-gray-600">
          {total != null
            ? `Mostrando ${start}-${end} de ${total}`
            : `Mostrando ${visibleCount} filas`}
        </div>
        {leftSlot}
      </div>

      {/* Selector de tamaño */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600">{rowsPerPageLabel}</label>
        <select
          value={pageSize}
          onChange={(e) => {
            const n = Number(e.target.value);
            setPageSize(n);
            table.setPageSize(n);
            table.setPageIndex(0); // reset a primera
          }}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Paginador */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrev}
          title="Primera"
          aria-label="Primera página"
        >
          «
        </button>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          onClick={() => table.previousPage()}
          disabled={!canPrev}
          title="Anterior"
          aria-label="Página anterior"
        >
          ‹
        </button>

        <span className="text-xs text-gray-600 px-1">
          Página {pageIndex + 1} / {pageCount}
        </span>

        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          onClick={() => table.nextPage()}
          disabled={!canNext}
          title="Siguiente"
          aria-label="Página siguiente"
        >
          ›
        </button>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
          title="Última"
          aria-label="Última página"
        >
          »
        </button>

        {rightSlot}
      </div>
    </div>
  );
}
