import type { StateOpportunityResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { stateOpportunityGuards } from "../../utils/guards";

export function StatesTable({
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
  canExportState = true,
  canEditState = true,
  canEditStatusState = true,
}: {
  data: StateOpportunityResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: StateOpportunityResponseDto) => void;
  onToggleStatus: (row: StateOpportunityResponseDto) => void;
  onDelete: (row: StateOpportunityResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canExportState?: boolean;
  canEditState?: boolean;
  canEditStatusState?: boolean;
}) {
  const columns = useMemo<ColumnDef<StateOpportunityResponseDto, any>[]>(
    () => [
      buildSelectColumn<StateOpportunityResponseDto>(),
      {
        accessorKey: "stateDesc",
        meta: { className: "truncate", label: "Estados" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estados <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.stateDesc}
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
        accessorKey: "numPercPro",
        meta: { className: "truncate", label: "Progreso" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Progreso <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const value = row.original.numPercPro ?? 0; // porcentaje (0–100)
          return (
            <div
              className="w-full group relative"
              title={`${value}%`} // Tooltip nativo
            >
              <div className="h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-gray-400 transition-all duration-300"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
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
          const inUse = stateOpportunityGuards.isInUse(row.original);
          const _canToggle = stateOpportunityGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditState && (
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              )}

              {canEditStatusState && (
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
    [onEdit, onToggleStatus, onDelete, canEditState, canEditStatusState]
  );

  const colsExport: ColumnSpec<StateOpportunityResponseDto>[] = [
    { label: "Descripción", value: (r) => r.stateDesc },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Estados de oportunidades",
    title: "Reporte de Estados de oportunidades",
  };
  return (
    <DataTable<StateOpportunityResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportState ? {
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      } : undefined}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar... (estados)"
    />
  );
}
