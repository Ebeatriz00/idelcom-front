import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { WarehousesResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { PropsTable } from "../../utils/warehouse.type";

export function WarehousesTable({
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
  canEditWHouses = true,
  canExportWHouses = true,
  canEditStatusWHouses = true,
}: PropsTable) {
  const columns = useMemo<ColumnDef<WarehousesResponseDto, any>[]>(
    () => [
      {
        ...buildSelectColumn<WarehousesResponseDto>(),
      },
      {
        accessorKey: "description",
        meta: { className: "flex-1 px-2 py-1 align-middle" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Almacén <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          const description = row.original.description;

          return (
            <div className="flex items-start gap-2">
              <div>
                <span className="font-semibold text-gray-900">
                  {description}
                </span>
              </div>
              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-medium">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[10px] font-medium">
                  inactivo
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "departmentDescription",
        header: () => <div className="text-center">Departamento</div>,
        meta: { className: "hidden md:table-cell text-center align-middle" },
      },
      {
        accessorKey: "address",
        header: () => <div className="text-center">Dirección</div>,
        meta: { className: "hidden md:table-cell text-center align-middle" },
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[100px]" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              {canEditWHouses && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}
              {canEditStatusWHouses && (
                <button
                  onClick={() => onToggleStatus(row.original)}
                  className="rounded-md p-1.5 hover:bg-emerald-50"
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
    [onEdit, onToggleStatus, onDelete, canEditWHouses, canEditStatusWHouses],
  );

  const colsExport: ColumnSpec<WarehousesResponseDto>[] = [
    { label: "Almacén", value: (r) => r.description },
    { label: "Dirección", value: (r) => r.address ?? "" },
    { label: "Departamento", value: (r) => r.departmentDescription ?? "" },
    { label: "Provincia", value: (r) => r.provinceDescription ?? "" },
    { label: "Distrito", value: (r) => r.districtDescription ?? "" },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Almacenes", title: "Reporte de Almacenes" };

  return (
    <DataTable<WarehousesResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportWHouses
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por almacén o dirección..."
    />
  );
}
