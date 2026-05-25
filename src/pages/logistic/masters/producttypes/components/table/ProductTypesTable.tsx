import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { ProductTypesResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import { productTypesGuards } from "../../utils/guards";
import type { PropsTable } from "../../utils/productType.type";

export function ProductTypesTable({
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
  canEditProdType = true,
  canExportProdType = true,
  canEditStatusProdType = true,
}: PropsTable) {
  const columns = useMemo<ColumnDef<ProductTypesResponseDto, any>[]>(
    () => [
      buildSelectColumn<ProductTypesResponseDto>(),
      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Tipo de Producto" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipo de Producto <ArrowUpDown className="size-3.5" />
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
        accessorKey: "isConsumable",
        meta: { className: "truncate text-center", label: "Consumible?" },
        header: () => <div className="text-center">Consumible?</div>,
      },
      {
        accessorKey: "isReturnable",
        meta: { className: "truncate text-center", label: "Retornable?" },
        header: () => <div className="text-center">Retornable?</div>,
      },
      {
        accessorKey: "requiresSerial",
        meta: { className: "truncate text-center", label: "Requiere Serie?" },
        header: () => <div className="text-center">Requiere Serie?</div>,
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);

          const inUse = productTypesGuards.isInUse(row.original);
          const canToggle = productTypesGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditProdType && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}
              {canEditStatusProdType && (
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
                        ? "No se puede desactivar: tipo en uso"
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
    [onEdit, onToggleStatus, onDelete, canEditProdType, canEditStatusProdType],
  );

  const colsExport: ColumnSpec<ProductTypesResponseDto>[] = [
    { label: "Tipo de Producto", value: (r) => r.description },
    { label: "Consumible?", value: (r) => (r.isConsumable ? "Sí" : "No") },
    { label: "Retornable?", value: (r) => (r.isReturnable ? "Sí" : "No") },
    {
      label: "Requiere Serie?",
      value: (r) => (r.requiresSerial ? "Sí" : "No"),
    },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "TiposProducto",
    title: "Reporte de Tipos de Producto",
  };

  return (
    <DataTable<ProductTypesResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportProdType
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por tipo de producto..."
    />
  );
}
