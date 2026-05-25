import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { CurrencyResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import { currencyGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function CurrencyTable({
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
  canEditCurrency = true,
  canEditStatusCurrency = true,
  canExportCurrency = true,
}: {
  data: CurrencyResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: CurrencyResponseDto) => void;
  onToggleStatus: (row: CurrencyResponseDto) => void;
  onDelete: (row: CurrencyResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditCurrency?: boolean;
  canEditStatusCurrency?: boolean;
  canExportCurrency?: boolean;
}) {
  const columns = useMemo<ColumnDef<CurrencyResponseDto, any>[]>(
    () => [
      buildSelectColumn<CurrencyResponseDto>(),
      {
        accessorKey: "description", // <-- 1. CAMBIO
        meta: { className: "truncate", label: "Moneda" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Moneda <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.description} {/* <-- CAMBIO */}
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
        accessorKey: "code",
        header: "Cód. ISO",
        meta: { className: "hidden sm:table-cell", label: "Cód. ISO" },
      },
      {
        accessorKey: "symbol",
        header: "Símbolo",
        meta: { className: "hidden sm:table-cell", label: "Símbolo" },
      },
      {
        accessorKey: "codeSunat",
        header: "Cód. SUNAT",
        meta: { className: "hidden md:table-cell", label: "Cód. SUNAT" },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = currencyGuards.isInUse(row.original);
          const _canToggle = currencyGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditCurrency && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusCurrency && (
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
                      : inUse
                        ? "No se puede desactivar: en uso"
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
    [onEdit, onToggleStatus, onDelete, canEditCurrency, canEditStatusCurrency],
  );

  const colsExport: ColumnSpec<CurrencyResponseDto>[] = [
    { label: "Nombre Moneda", value: (r) => r.description }, // <-- CAMBIO
    { label: "Código ISO", value: (r) => r.code }, // <-- CAMBIO
    { label: "Símbolo", value: (r) => r.symbol }, // <-- CAMBIO
    { label: "Cód. SUNAT", value: (r) => r.codeSunat ?? "" }, // <-- CAMBIO
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Monedas", title: "Reporte de Monedas" };
  return (
    <DataTable<CurrencyResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportCurrency
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar... (nombre, código, símbolo)"
    />
  );
}
