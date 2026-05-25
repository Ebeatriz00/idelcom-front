import type { ExchangeRateResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { exchangeRateGuards } from "../../utils/guards";

function formatDate(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

type PaginationState = { pageIndex: number; pageSize: number };

export function ExchangeRateTable({
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
  canEditExChangeRate = true,
  canEditStatusExChangeRate = true,
  canExportExChangeRate = true,
}: {
  data: ExchangeRateResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ExchangeRateResponseDto) => void;
  onToggleStatus: (row: ExchangeRateResponseDto) => void;
  onDelete: (row: ExchangeRateResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditExChangeRate?: boolean;
  canEditStatusExChangeRate?: boolean;
  canExportExChangeRate?: boolean;
}) {
  const columns = useMemo<ColumnDef<ExchangeRateResponseDto, any>[]>(
    () => [
      buildSelectColumn<ExchangeRateResponseDto>(),
      {
        accessorKey: "dateFxrate",
        meta: { className: "truncate", label: "Fecha" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {formatDate(row.original.dateFxrate)}
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
        accessorKey: "purchaseType",
        header: "Compra",
        meta: {
          className: "hidden sm:table-cell text-center",
          label: "Compra",
        },
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.purchaseType.toFixed(3)}
          </div>
        ),
      },
      {
        accessorKey: "saleType",
        header: "Venta",
        meta: { className: "text-center", label: "Venta" },
        cell: ({ row }) => (
          <div className="text-center">{row.original.saleType.toFixed(3)}</div>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const _canToggle = exchangeRateGuards.canToggle(row.original);
          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditExChangeRate && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}
              {canEditStatusExChangeRate && (
                <button
                  onClick={() => _canToggle && onToggleStatus(row.original)}
                  disabled={!_canToggle}
                  className="rounded-md p-1.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Activar/Desactivar"
                  title={
                    _canToggle
                      ? active
                        ? "Desactivar"
                        : "Activar"
                      : "Acción no permitida"
                  }
                >
                  <Power
                    className={`size-4 ${active ? "text-emerald-600" : "text-gray-400"}`}
                  />
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
      canEditExChangeRate,
      canEditStatusExChangeRate,
    ],
  );

  const colsExport: ColumnSpec<ExchangeRateResponseDto>[] = [
    { label: "Fecha", value: (r) => formatDate(r.dateFxrate) },
    { label: "Compra", value: (r) => r.purchaseType },
    { label: "Venta", value: (r) => r.saleType },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Tipos_de_Cambio",
    title: "Reporte de Tipos de Cambio",
  };

  return (
    <DataTable<ExchangeRateResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportExChangeRate
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por fecha (dd/mm/aaaa)..."
    />
  );
}
