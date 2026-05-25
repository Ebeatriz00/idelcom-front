import type { ModulesPermissionsResponseDto } from "@/application";
import { DataTable, buildSelectColumn } from "@/layouts/";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
} from "@/sharedKernel/";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  FileLock,
  List,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useModulesPermissionsFormModal } from "../../hooks/useModulesPermissionsFormModal";
import { ModulesPermissionsFormModal } from "../ModulesPermissionsFromModal";
import { PermissionsMiniListModal } from "../PermissionsListModal";
import type { MiniPermission } from "./PermissionsList";

type PaginationState = { pageIndex: number; pageSize: number };

export function ModulesPermissionsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onVisibleCountChange,
  search,
  onSearchChange,
}: {
  data: ModulesPermissionsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: ModulesPermissionsResponseDto) => void;
  onToggleStatus: (row: ModulesPermissionsResponseDto) => void;
  onDelete: (row: ModulesPermissionsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}) {
  const [miniOpen, setMiniOpen] = useState(false);
  const [miniRow, setMiniRow] = useState<ModulesPermissionsResponseDto | null>(
    null
  );
  const {
    open,
    isFetching,
    defaultValues,
    saving,
    submit,
    close,
    openEditSeeded,
    uiLocks,
  } = useModulesPermissionsFormModal();

  function onEditPermissionFromMini(perm: MiniPermission) {
    if (!miniRow) return;
    setMiniOpen(false);
    openEditSeeded({
      modulesPermissionsId: (miniRow as any).modulesPermissionsId,
      modulesId: (miniRow as any).modulesId ?? (miniRow as any).ModulesId,
      permissionsId: perm.permissionsId,
      moduleLabel: miniRow.modulesName,
      permissionLabel: perm.permissionsName,
      lockModule: true,
    });
  }

  const columns = useMemo<ColumnDef<ModulesPermissionsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ModulesPermissionsResponseDto>(),

      {
        accessorKey: "modulesName",
        meta: { className: "truncate", label: "Módulo" },
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
              <span className="truncate font-medium text-gray-900">
                {row.original.modulesName}
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
        accessorKey: "modulesDescription",
        header: "Descripción",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Descripción" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.modulesDescription ?? "—"}
          </span>
        ),
      },

      {
        accessorKey: "totalPermissions",
        meta: {
          className: "hidden md:table-cell whitespace-nowrap text-right",
          label: "Total Permisos",
        },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Permisos <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1 text-gray-700">
                <FileLock className="size-4" /> {r.totalPermissions ?? 0}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                title="Ver permisos del módulo"
                onClick={() => {
                  setMiniRow(r);
                  setMiniOpen(true);
                }}
              >
                <List className="size-3.5" /> Ver
              </button>
            </div>
          );
        },
      },

      {
        accessorKey: "activePermissions",
        meta: {
          className: "hidden md:table-cell whitespace-nowrap text-right",
          label: "Permisos Activos",
        },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Permisos Act <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-gray-700">
            <ShieldCheck className="size-4" />{" "}
            {row.original.activePermissions ?? 0}
          </span>
        ),
      },

      {
        accessorKey: "UsedInProfiles",
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
            <Users2 className="size-4" /> {row.original.UsedInProfiles ?? 0}
          </span>
        ),
      },
    ],
    [onEdit, onToggleStatus]
  ); // deps de callbacks externos

  const colsExport: ColumnSpec<ModulesPermissionsResponseDto>[] = [
    { label: "Módulo", value: (r) => r.modulesName },
    { label: "Descripción", value: (r) => r.modulesDescription ?? "" },
    { label: "Usuarios", value: (r) => r.UsedInProfiles ?? 0 },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Módulos permisos",
    title: "Reporte de Módulos permisos",
  };

  return (
    <>
      <DataTable<ModulesPermissionsResponseDto>
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
        searchPlaceholder="Buscar… (nombre, descripción)"
      />

      <PermissionsMiniListModal
        open={miniOpen}
        onClose={() => setMiniOpen(false)}
        moduleName={miniRow?.modulesName ?? "Módulo"}
        items={(miniRow?.listModulesPermissions ?? []) as MiniPermission[]}
        onEditPermission={(perm) => onEditPermissionFromMini(perm)}
      />

      <ModulesPermissionsFormModal
        open={open}
        title={
          defaultValues.modulesPermissionsId
            ? "Editar módulo permiso"
            : "Nuevo módulo permiso"
        }
        loadingDetail={isFetching}
        defaultValues={defaultValues}
        onClose={close}
        saving={saving}
        onSubmit={submit}
        lockModule={uiLocks.lockModule}
        moduleLabel={uiLocks.moduleLabel}
        permissionLabel={uiLocks.permissionLabel}
      />
    </>
  );
}
