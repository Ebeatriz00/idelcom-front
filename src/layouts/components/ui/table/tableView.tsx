// shared/table/TableView.tsx
import { DragScrollX } from "@/layouts";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";

type Props<T> = {
  table: Table<T>;
  emptyMessage?: ReactNode;
  className?: string;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  rightAlignIds?: string[];
  rowProps?: (row: Row<T>) => HTMLAttributes<HTMLTableRowElement>;
};

export function TableView<T>({
  table,
  emptyMessage = "Sin resultados",
  className = "overflow-x-auto",
  tableClassName = "w-full table-fixed text-sm",
  theadClassName = "",
  tbodyClassName = "divide-y divide-gray-100",
  rightAlignIds = ["actions"],
  rowProps,
}: Props<T>) {
  const visibleCols = table.getVisibleLeafColumns();
  const colCount = visibleCols.length;

  return (
    <div className={className}>
      <DragScrollX className={className}>
        <table className={tableClassName}>
          <thead className={theadClassName}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left">
                {hg.headers.map((h) => {
                  const isSelect = h.column.id === "select";

                  return (
                    <th
                      key={h.id}
                      className={[
                        // base
                        "py-3 px-2 last:pr-4",
                        isSelect ? "px-0 pl-2" : "first:pl-4",
                        "bg-gray-50 text-gray-600",
                        "border-b border-gray-200",
                        "whitespace-nowrap",
                        "min-w-0",
                        rightAlignIds.includes(h.column.id)
                          ? "text-right"
                          : "text-left",
                        (h.column.columnDef as any)?.meta?.className ?? "",
                      ].join(" ")}
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className={tbodyClassName}>
            {table.getRowModel().rows.map((row) => {
              const tr = rowProps?.(row) ?? {};

              return (
                <tr
                  key={row.id}
                  {...tr}
                  className={`transition-colors ${tr.className ?? "hover:bg-blue-50"}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelect = cell.column.id === "select";

                    return (
                      <td
                        key={cell.id}
                        className={[
                          "py-2 px-2 last:pr-4 align-top min-w-0",
                          isSelect ? "px-0 pl-2" : "first:pl-4",
                          rightAlignIds.includes(cell.column.id)
                            ? "text-right"
                            : "",
                          (cell.column.columnDef as any)?.meta?.className ?? "",
                        ].join(" ")}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={colCount}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DragScrollX>

      <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white/80" />
    </div>
  );
}
