import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { DocumentTypeResponseDto } from "@/application/dtos/general/DocumentType/DocumentTypeResponse.dto";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import { documentTypeGuards } from "../../utils/guards";
type PaginationState = { pageIndex: number; pageSize: number };

export function DocumentTypesTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  canEditDocumentType = true,
  canEditStatusDocumentType = true,
  canExportDocumentType = true,
}: {
  data: DocumentTypeResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: DocumentTypeResponseDto) => void;
  onToggleStatus: (row: DocumentTypeResponseDto) => void;
  onDelete: (row: DocumentTypeResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditDocumentType?: boolean;
  canEditStatusDocumentType?: boolean;
  canExportDocumentType?: boolean;
}) {
  const columns = useMemo<ColumnDef<DocumentTypeResponseDto, any>[]>(
    () => [
      buildSelectColumn<DocumentTypeResponseDto>(),

      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Documento" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Documento <ArrowUpDown className="size-3.5" />
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
        accessorKey: "codeSunat",
        header: "Cód. SUNAT",
        enableGlobalFilter: true,
        meta: { className: "hidden sm:table-cell", label: "Cód. SUNAT" },
        cell: ({ row }) => (
          <span className="text-gray-700">{row.original.codeSunat ?? "—"}</span>
        ),
      },

      {
        accessorKey: "abrv",
        meta: {
          className: "hidden md:table-cell",
          label: "Abreviatura",
        },
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Abreviatura <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-gray-700">{row.original.abrv ?? "—"}</span>
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
          const inUse = documentTypeGuards.isInUse(row.original);
          const _canToggle = documentTypeGuards.canToggle(row.original);

          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              {canEditDocumentType && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusDocumentType && (
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
    [
      onEdit,
      onToggleStatus,
      onDelete,
      canEditDocumentType,
      canEditStatusDocumentType,
    ],
  );

  const colsExport: ColumnSpec<DocumentTypeResponseDto>[] = [
    { label: "Descripción", value: (r) => r.description },
    { label: "Cód. SUNAT", value: (r) => r.codeSunat ?? "" },
    { label: "Abreviatura", value: (r) => r.abrv ?? "" },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Tipos_Documento",
    title: "Reporte de Tipos de Documento",
  };
  return (
    <DataTable<DocumentTypeResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportDocumentType
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchPlaceholder="Buscar… (descripción, cód. SUNAT)"
    />
  );
}
