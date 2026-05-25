import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { SeriesResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { exportCSV, exportExcel, exportPdf } from "@/sharedKernel";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import { statusToBool } from "@/sharedKernel/utils/status";
import { seriesGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function SeriesTable({
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
  canEditSeries = true,
  canEditStatusSeries = true,
  canExportSeries = true,
}: {
  data: SeriesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: SeriesResponseDto) => void;
  onToggleStatus: (row: SeriesResponseDto) => void;
  onDelete: (row: SeriesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditSeries?: boolean;
  canEditStatusSeries?: boolean;
  canExportSeries?: boolean;
}) {
  const columns = useMemo<ColumnDef<SeriesResponseDto, any>[]>(
    () => [
      buildSelectColumn<SeriesResponseDto>(),
      {
        accessorKey: "seriesName",
        meta: { className: "truncate", label: "Serie" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Serie <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.seriesName}
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
        accessorKey: "paymentTypeDescription",
        header: "Tipo de Comprobante",
        meta: {
          className: "hidden sm:table-cell",
          label: "Tipo de Comprobante",
        },
      },
      {
        accessorKey: "correlative",
        header: "Correlativo",
        meta: { className: "hidden sm:table-cell", label: "Correlativo" },
      },

      {
        accessorKey: "used",
        header: "Indicador",
        meta: {
          className: "hidden md:table-cell text-center",
          label: "Indicador",
        },
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">
            {row.original.used}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = seriesGuards.isInUse(row.original);
          const canToggle = seriesGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditSeries && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusSeries && (
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
                        ? "No se puede desactivar: serie en uso"
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
    [onEdit, onToggleStatus, onDelete, canEditSeries, canEditStatusSeries],
  );

  const colsExport: ColumnSpec<SeriesResponseDto>[] = [
    { label: "Serie", value: (r) => r.seriesName },
    { label: "Tipo de Comprobante", value: (r) => r.paymentTypeDescription },
    { label: "Correlativo", value: (r) => r.correlative.toString() },
    { label: "Indicador de Uso", value: (r) => r.used },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Series", title: "Reporte de Series" };

  return (
    <DataTable<SeriesResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportSeries
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por serie o tipo de comprobante..."
    />
  );
}
