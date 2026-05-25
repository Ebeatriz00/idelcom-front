import type { ProfilesPermissionsResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Power } from "lucide-react";
import { useMemo } from "react";
import { profilesPermissionsGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function ProfilesPermissionsList({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
}: {
  data: ProfilesPermissionsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  search: string;
  onSearchChange: (q: string) => void;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onToggleStatus: (row: ProfilesPermissionsResponseDto) => void;
  onDelete: (row: ProfilesPermissionsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
}) {
  const columns = useMemo<ColumnDef<ProfilesPermissionsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ProfilesPermissionsResponseDto>(),
      {
        accessorKey: "modulesName",
        meta: { className: "truncate", label: "Módulo" },
        enableGlobalFilter: true, // ✅ Esto debe estar en true
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Módulo <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const isActive = statusToBool(status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.modulesName}
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
        accessorKey: "permissionsName",
        header: "Permiso",
        enableGlobalFilter: true, // ✅ Esto debe estar en true
        meta: { className: "hidden sm:table-cell", label: "Permiso" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.permissionsName ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[120px]" },
        enableSorting: false,
        enableGlobalFilter: false, // ✅ Las columnas de acciones no deben ser buscables
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = profilesPermissionsGuards.isInUse(row.original);
          const _canToggle = profilesPermissionsGuards.canToggle(row.original);

          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
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
    [onToggleStatus, onDelete]
  );

  return (
    <DataTable<ProfilesPermissionsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      searchPlaceholder="Buscar… (Módulo, permiso)"
      searchValue={search}
      onSearchChange={onSearchChange}
    />
  );
}