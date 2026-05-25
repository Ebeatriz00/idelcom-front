import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil } from "lucide-react";
import { useMemo } from "react";

import type { CategoriesResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { PropsTable } from "../../utils/categories.type";

export function CategoriesTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  search,
  onSearchChange,
  canExportCategories = true,
  canEditCategories = true,
  canEditStatusCategories = true,
}: PropsTable) {
  const columns = useMemo<ColumnDef<CategoriesResponseDto, any>[]>(
    () => [
      buildSelectColumn<CategoriesResponseDto>(),
      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Categoría" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Categoría <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.description}
              </span>
              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                  inactivo
                </span>
              )}
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditCategories && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [
      onEdit,
      onToggleStatus,
      onDelete,
      canEditCategories,
      canEditStatusCategories,
    ],
  );

  const colsExport: ColumnSpec<CategoriesResponseDto>[] = [
    { label: "Categoría", value: (r) => r.description },

    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Categorías", title: "Reporte de Categorías" };

  return (
    <DataTable<CategoriesResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportCategories
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por categoría..."
    />
  );
}
