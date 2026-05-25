import type { RequirementResponseItemDto } from "@/application/dtos/operations/requirement/requeriment.dto";
import { buildSelectColumn, DataTable } from "@/layouts";
import { exportCSV, exportExcel, exportPdf, statusToBool, type ColumnSpec } from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Pencil, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import type { PropsTable } from "../../utils/types";

export function RequirementTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
  search,
  onSearchChange,
  canExport = true,
}: PropsTable) {
  const columns = useMemo<ColumnDef<RequirementResponseItemDto>[]>(
    () => [
      buildSelectColumn<RequirementResponseItemDto>(),
      {
        accessorKey: "name",
        meta: { className: "whitespace-normal", label: "Requerimiento" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Requerimiento
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.isActive);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 whitespace-normal">
                {row.original.name}
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
        accessorKey: "description",
        meta: { className: "whitespace-normal", label: "Descripción" },
        header: () => <div>Descripción</div>,
      },
      {
        accessorKey: "scopeName",
        meta: { className: "truncate text-center", label: "Alcance" },
        header: () => <div className="text-center">Alcance</div>,
      },
      {
        accessorKey: "hasExpiration",
        meta: { className: "truncate text-center", label: "Vencimiento?" },
        header: () => <div className="text-center">Vencimiento?</div>,
      },
      {
        accessorKey: "requiresFile",
        meta: { className: "truncate text-center", label: "Archivos?" },
        header: () => <div className="text-center">Archivos?</div>,
      },
      {
        accessorKey: "maxFileSize",
        meta: { className: "truncate text-center", label: "Tamaño máximo" },
        header: () => <div className="text-center">Tamaño máximo</div>,
      },
      {
        accessorKey: "allowedExtensions",
        meta: { className: "truncate text-center", label: "Extensiones permitidas" },
        header: () => <div className="text-center">Extensiones permitidas</div>,
      },
      {
        accessorKey: "allowInternalReuse",
        meta: { className: "truncate text-center", label: "Se reutiliza?" },
        header: () => <div className="text-center">Se reutiliza?</div>,
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[100px]" },
        cell: ({ row }) => {
          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>

              <button
                onClick={() => onDelete(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                title="Eliminar"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete],
  );
  const colsExport: ColumnSpec<RequirementResponseItemDto>[] = [
    { label: "Requerimiento", value: (row) => row.name },
    { label: "Descripción", value: (row) => row.description },
    { label: "Alcance", value: (row) => row.scopeName },
    {
      label: "Vencimiento?",
      value: (row) => (row.hasExpiration ? "Sí" : "No"),
    },
    { label: "Archivos?", value: (row) => (row.requiresFile ? "Sí" : "No") },
    {
      label: "Tamaño máximo",
      value: (row) => (row.maxFileSize ? `${row.maxFileSize} MB` : "N/A"),
    },
    { label: "Extensiones permitidas", value: (row) => row.allowedExtensions },
    {
      label: "Se reutiliza?",
      value: (row) => (row.allowInternalReuse ? "Sí" : "No"),
    },
    { label: "Activo", value: (row) => (statusToBool(row.isActive) ? "Sí" : "No") },
  ];

  const opts = {
    filePrefix: "Requirimientos",
    title: "Reporte de Requirimientos",
  };

  return (
    <DataTable<RequirementResponseItemDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      exportFns={
        canExport
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar..."
    />
  );
}
