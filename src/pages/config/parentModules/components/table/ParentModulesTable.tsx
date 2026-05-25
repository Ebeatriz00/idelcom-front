import type { ParentModulesResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
} from "@/sharedKernel";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power, Users2 } from "lucide-react";
import { useMemo } from "react";
import { parentModulesGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };
export function ParentModulesTable({
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
  loading,
}: {
  data: ParentModulesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: ParentModulesResponseDto) => void;
  onToggleStatus: (row: ParentModulesResponseDto) => void;
  onDelete: (row: ParentModulesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  loading?: boolean;
}) {
  const columns = useMemo<ColumnDef<ParentModulesResponseDto, any>[]>(
    () => [
      buildSelectColumn<ParentModulesResponseDto>(),

      // Nombre
      {
        accessorKey: "code",
        meta: { className: "truncate", label: "Nombre" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Código <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const status =
            (row.original as any).Status ?? (row.original as any).status;
          const isActive = statusToBool(status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.code}
              </span>
              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px]">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[10px]">
                  inactivo
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Sección",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Sección" },
        cell: ({ row }) => (
          <span className="text-gray-700">{row.original.title ?? "—"}</span>
        ),
      },
      {
        accessorKey: "stickyBottom",
        header: "Sitio",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Sección" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.stickyBottom ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "orderNo",
        header: "Orden",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Sección" },
        cell: ({ row }) => (
          <span className="text-gray-700">{row.original.orderNo ?? "—"}</span>
        ),
      },
      {
        accessorKey: "parentCount",
        meta: {
          className: "hidden md:table-cell whitespace-nowrap text-right",
          label: "Usuarios",
        },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Usuarios <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Users2 className="size-4" /> {row.original.parentCount ?? 0}
          </span>
        ),
      },

      // Acciones
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[120px]" },
        enableSorting: false,
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = parentModulesGuards.isInUse(row.original);
          const _canToggle = parentModulesGuards.canToggle(row.original);

          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => _canToggle && onToggleStatus(row.original)}
                disabled={!_canToggle}
                className="rounded-md p-1.5 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Activar/Desactivar"
                title={
                  _canToggle
                    ? active
                      ? "Desactivar"
                      : "Activar"
                    : inUse
                    ? "No se puede desactivar: madulo padre en uso"
                    : "Acción no permitida"
                }
              >
                <Power
                  className={`size-4 ${
                    active ? "text-emerald-600" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onToggleStatus, onDelete]
  );

  const colsExport: ColumnSpec<ParentModulesResponseDto>[] = [
    { label: "Código", value: (r) => r.code },
    { label: "Sección", value: (r) => r.title ?? "" },
    { label: "Orden", value: (r) => r.orderNo },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Módulos Padres",
    title: "Reporte de Módulos Padre",
  };
  return (
    <DataTable<ParentModulesResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={{
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      }}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar… (código, sección)"
      loading={loading}
    />
  );
}
