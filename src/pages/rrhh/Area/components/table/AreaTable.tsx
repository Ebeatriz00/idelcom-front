import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Briefcase,
  Pencil,
  Power,
} from "lucide-react";
import { useMemo } from "react";

import type { AreaResponseDto } from "@/application";
import { DataTable, buildSelectColumn } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";

type PaginationState = { pageIndex: number; pageSize: number };

export function AreasTable({
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
  canEditArea = true,
  canEditStatusArea = true,
  canExportArea = true,
}: {
  data: AreaResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: AreaResponseDto) => void;
  onToggleStatus: (row: AreaResponseDto) => void;
  onDelete: (row: AreaResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditArea?: boolean;
  canEditStatusArea?: boolean;
  canExportArea?: boolean;
}) {
  const columns = useMemo<ColumnDef<AreaResponseDto, any>[]>(
    () => [
      {
        ...buildSelectColumn<AreaResponseDto>(),
        meta: { className: "w-[40px]" },
      },

      {
        accessorKey: "description",
        meta: { className: "truncate flex-1 px-2 py-1", label: "Área" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Área <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900 truncate">
                {row.original.description}
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
        accessorKey: "areaCount",
        meta: {
          className:
            "hidden md:table-cell whitespace-nowrap text-right w-[80px]",
          label: "Cantidad",
        },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cantidad <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Briefcase className="size-4" /> {row.original.areaCount ?? 0}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[100px]" },
        enableSorting: false,
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              {canEditArea && (
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              )}

              {canEditStatusArea && (
              <button
                onClick={() => onToggleStatus(row.original)}
                className="rounded-md p-1.5 hover:bg-emerald-50"
                aria-label="Activar/Desactivar"
                title={active ? "Desactivar" : "Activar"}
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
    [onEdit, onToggleStatus, onDelete, canEditArea, canEditStatusArea]
  );

  const colsExport: ColumnSpec<AreaResponseDto>[] = [
    { label: "Área", value: (r) => r.description ?? "" },
    { label: "Cantidad", value: (r) => r.areaCount ?? 0 },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Areas", title: "Reporte de Áreas" };

  return (
    <DataTable<AreaResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportArea ?{
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      }
      : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar… (nombre de área)"
    />
  );
}
