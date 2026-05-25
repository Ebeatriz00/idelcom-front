import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { UomResponseDto } from "@/application"; // DTO actualizado
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import { uomGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function UomTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  canEditUom = true,
  canEditStatusUom = true,
  canExportUom = true,
}: {
  data: UomResponseDto[]; // Prop actualizada
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: UomResponseDto) => void; // Prop actualizada
  onToggleStatus: (row: UomResponseDto) => void; // Prop actualizada
  onDelete: (row: UomResponseDto) => void; // Prop actualizada
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditUom?: boolean;
  canEditStatusUom?: boolean;
  canExportUom?: boolean;
}) {
  const columns = useMemo<ColumnDef<UomResponseDto, any>[]>(
    () => [
      buildSelectColumn<UomResponseDto>(),
      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Unidad de Medida" }, // Label actualizado
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Unidad de Medida <ArrowUpDown className="size-3.5" />
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
          const inUse = uomGuards.isInUse(row.original);
          const _canToggle = uomGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditUom && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusUom && (
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
    [onEdit, onToggleStatus, onDelete, canEditUom, canEditStatusUom],
  );

  // Columnas para la exportación
  const colsExport: ColumnSpec<UomResponseDto>[] = [
    { label: "Nombre Unidad Medida", value: (r) => r.description }, // Actualizado
    { label: "Símbolo", value: (r) => r.symbol },
    { label: "Cód. SUNAT", value: (r) => r.codeSunat ?? "" },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "UnidadesMedida",
    title: "Reporte de Unidades de Medida",
  };
  return (
    <DataTable<UomResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportUom
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchPlaceholder="Buscar... (nombre, código SUNAT, símbolo)"
    />
  );
}
