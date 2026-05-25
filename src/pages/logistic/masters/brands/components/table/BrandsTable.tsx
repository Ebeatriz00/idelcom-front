import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { BrandsResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { PropsTable } from "../../utils/brands.type";
import { brandsGuards } from "../../utils/guards";

export function BrandsTable({
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
  canEditBrands = true,
  canExportBrands = true,
  canEditStatusBrands = true,
}: PropsTable) {
  const columns = useMemo<ColumnDef<BrandsResponseDto, any>[]>(
    () => [
      buildSelectColumn<BrandsResponseDto>(),
      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Marca" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Marca <ArrowUpDown className="size-3.5" />
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
          const active = statusToBool(row.original.status);

          const inUse = brandsGuards.isInUse(row.original);
          const canToggle = brandsGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditBrands && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusBrands && (
                <button
                  onClick={() => canToggle && onToggleStatus(row.original)}
                  disabled={!canToggle}
                  className="rounded-md p-1.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Activar/Desactivar"
                  title={
                    canToggle
                      ? active
                        ? "Desactivar"
                        : "Activar"
                      : inUse
                        ? "No se puede desactivar: marca en uso"
                        : "Acción no permitida"
                  }
                >
                  <Power
                    className={`size-4 ${
                      active ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onToggleStatus, onDelete, canEditBrands, canEditStatusBrands],
  );

  const colsExport: ColumnSpec<BrandsResponseDto>[] = [
    { label: "Marca", value: (r) => r.description },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Marcas", title: "Reporte de Marcas" };

  return (
    <DataTable<BrandsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportBrands
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por marca..."
    />
  );
}
