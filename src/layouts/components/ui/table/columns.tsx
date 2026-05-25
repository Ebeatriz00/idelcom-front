import { IndeterminateCheckbox } from "@/layouts/presentation/checkBox";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function buildSelectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <IndeterminateCheckbox
          ariaLabel="Seleccionar todo"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <IndeterminateCheckbox
          ariaLabel="Seleccionar fila"
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected?.() ?? false}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    meta: {
      label: "Seleccionar",
      className:
        "hidden sm:table-cell w-[44px] max-w-[44px] px-0 text-center align-middle",
    },
    enableSorting: false,
    enableHiding: false,
  };
}
export function buildTextColumn<T>(key: keyof T, label: string): ColumnDef<T> {
  return {
    accessorKey: key as string,
    meta: { className: "truncate", label },
    header: ({ column }) => (
      <button
        className="inline-flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label} <ArrowUpDown className="size-3.5" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="text-gray-700">{(row.original as any)[key] ?? "—"}</span>
    ),
  };
}
