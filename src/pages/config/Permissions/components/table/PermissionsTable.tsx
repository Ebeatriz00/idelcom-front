import type { PermissionsResponseDto } from "@/application/dtos/configurations/Permissions/PermissionsResponse.dto";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { exportCSV, exportExcel, exportPdf } from "@/sharedKernel";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power, Users2 } from "lucide-react";
import { useMemo } from "react";
import { permissionsGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function PermissionsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
}: {
  data: PermissionsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: PermissionsResponseDto) => void;
  onToggleStatus: (row: PermissionsResponseDto) => void;
  onDelete: (row: PermissionsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
}) {
  const columns = useMemo<ColumnDef<PermissionsResponseDto, any>[]>(
    () => [
      buildSelectColumn<PermissionsResponseDto>(),

      // Nombre
      {
        accessorKey: "permissionsName",
        meta: { className: "truncate", label: "Nombre" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const status =
            (row.original as any).Status ?? (row.original as any).status;
          const isActive = statusToBool(status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.permissionsName}
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
        accessorKey: "permissionsDescription",
        header: "Descripción",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Descripción" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.permissionsDescription ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "permissionsCount",
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
            <Users2 className="size-4" /> {row.original.permissionsCount ?? 0}
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
          const inUse = permissionsGuards.isInUse(row.original);
          const _canToggle = permissionsGuards.canToggle(row.original);

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
                      ? "No se puede desactivar: perfil en uso"
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
    [onEdit, onToggleStatus, onDelete],
  );

  const colsExport: ColumnSpec<PermissionsResponseDto>[] = [
    { label: "Permisos", value: (r) => r.permissionsName },
    { label: "Descripción", value: (r) => r.permissionsDescription ?? "" },
    { label: "Usuarios", value: (r) => r.permissionsCount ?? 0 },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Permisos", title: "Reporte de Permisos" };
  return (
    <DataTable<PermissionsResponseDto>
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
      searchPlaceholder="Buscar… (nombre, descripción)"
    />
  );
}
