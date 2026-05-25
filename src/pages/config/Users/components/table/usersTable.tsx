import type { UsersResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Pencil,
  Power,
  RotateCcwKey,
} from "lucide-react";
import { useMemo } from "react";
import { usersGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };
export function UsersTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onChangeP,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  search,
  onSearchChange,
  loading,
}: {
  data: UsersResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: UsersResponseDto) => void;
  onChangeP : (row: UsersResponseDto) => void;
  onToggleStatus: (row: UsersResponseDto) => void;
  onDelete: (row: UsersResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  loading?: boolean;
}) {
  const columns = useMemo<ColumnDef<UsersResponseDto, any>[]>(
    () => [
      buildSelectColumn<UsersResponseDto>(),

      {
        accessorKey: "usersPhoto",
        header: "Foto",
        enableGlobalFilter: false,
        meta: { className: "hidden sm:table-cell", label: "Foto" },
        cell: ({ row }) => {
          const photoUrl = row.original.usersPhoto;

          return photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto de usuario"
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          );
        },
      },
      {
        accessorKey: "user",
        meta: { className: "truncate", label: "Nombre" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Usuario <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const status =
            (row.original as any).Status ?? (row.original as any).status;
          const isActive = statusToBool(status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.user}
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
        accessorKey: "documentType",
        header: "Tipo Doc",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Sección" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.documentType ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "descriptionProfiles",
        header: "Perfil",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Sección" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.descriptionProfiles ?? "—"}
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
          const _canToggle = usersGuards.canToggle(row.original);

          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              <button
                onClick={() => onChangeP(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Cambiar Contraseña"
                title="Cambiar Contraseña"
              >
                <RotateCcwKey className="size-5 text-yellow-600" />
              </button>
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4 " />
              </button>
              <button
                onClick={() => _canToggle && onToggleStatus(row.original)}
                disabled={!_canToggle}
                className="rounded-md p-1.5 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Activar/Desactivar"
                title={_canToggle ? (active ? "Desactivar" : "Activar") : ""}
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
    [onChangeP, onEdit, onToggleStatus, onDelete]
  );

  const colsExport: ColumnSpec<UsersResponseDto>[] = [
    { label: "Usuario", value: (r) => r.user },
    { label: "Tipo Doc", value: (r) => r.documentType ?? "" },
    { label: "Documento", value: (r) => r.usersDocument },
    { label: "Perfil", value: (r) => r.descriptionProfiles },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Usuarios",
    title: "Reporte de Usuarios",
  };
  return (
    <DataTable<UsersResponseDto>
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
      searchPlaceholder="Buscar… ( usuarios, documento)"
      loading={loading}
    />
  );
}
