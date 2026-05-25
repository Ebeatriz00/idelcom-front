import type { LeadsStatusResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import { exportCSV, exportExcel, exportPdf, statusToBool, type ColumnSpec } from "@/sharedKernel";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { leadsStatusGuards } from "../../utils/guards";

export function StatusTable({
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
  canEditStatus = true,
  canEdit = true,
  canExportStatus,
}: {
  data: LeadsStatusResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: LeadsStatusResponseDto) => void;
  onToggleStatus: (row: LeadsStatusResponseDto) => void;
  onDelete: (row: LeadsStatusResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditStatus?: boolean;
  canEdit?: boolean;
  canExportStatus?: boolean;
}) {
  const columns = useMemo<ColumnDef<LeadsStatusResponseDto, any>[]>(
    () => [
      buildSelectColumn<LeadsStatusResponseDto>(),
      {
        accessorKey: "description",
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
        accessorKey: "leadsStatusCount",
        meta: {
          className: "hidden md:table-cell whitespace-nowrap text-right",
          label: "Uso",
        },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            En Uso <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-gray-700">
            {row.original.leadsStatusCount ?? 0}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = leadsStatusGuards.isInUse(row.original);
          const _canToggle = leadsStatusGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEdit && (
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              )}

              {canEditStatus && (
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
    [onEdit, onToggleStatus, onDelete, canEdit, canEditStatus]
  );

  const colsExport: ColumnSpec<LeadsStatusResponseDto>[] = [
    { label: "Estados", value: (r) => r.description },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Estados leads",
    title: "Reporte de Estados leads",
  };
  return (
    <DataTable<LeadsStatusResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportStatus ? {
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      } 
      : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar... (estados)"
    />
  );
}
