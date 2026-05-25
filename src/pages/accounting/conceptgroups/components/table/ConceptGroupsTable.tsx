import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { ConceptGroupsResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { exportCSV, exportExcel, exportPdf } from "@/sharedKernel";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import { statusToBool } from "@/sharedKernel/utils/status";
import { conceptGroupsGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function ConceptGroupsTable({
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
  canEditAccGroups = true,
  canEditStatusAccGroups = true,
  canExportAccGroups = true,
}: {
  data: ConceptGroupsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ConceptGroupsResponseDto) => void;
  onToggleStatus: (row: ConceptGroupsResponseDto) => void;
  onDelete: (row: ConceptGroupsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditAccGroups?: boolean;
  canEditStatusAccGroups?: boolean;
  canExportAccGroups?: boolean;
}) {
  const columns = useMemo<ColumnDef<ConceptGroupsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ConceptGroupsResponseDto>(),
      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Descripción" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Descripción <ArrowUpDown className="size-3.5" />
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
        accessorKey: "conceptTypeDescription",
        header: "Tipo de Concepto",
        meta: { className: "hidden sm:table-cell", label: "Tipo de Concepto" },
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);

          const inUse = conceptGroupsGuards.isInUse(row.original);
          const canToggle = conceptGroupsGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditAccGroups && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 hover:bg-gray-100"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusAccGroups && (
                <button
                  onClick={() => canToggle && onToggleStatus(row.original)}
                  disabled={!canToggle}
                  className="rounded-md p-1.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Activar/Desactivar"
                  title={
                    canToggle
                      ? active
                        ? "Desactivar"
                        : "Activar"
                      : inUse
                        ? "No se puede desactivar: grupo en uso"
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
      canEditAccGroups,
      canEditStatusAccGroups,
    ],
  );

  const colsExport: ColumnSpec<ConceptGroupsResponseDto>[] = [
    { label: "Descripción", value: (r) => r.description },
    { label: "Código", value: (r) => r.code },
    { label: "Tipo de Concepto", value: (r) => r.conceptTypeDescription },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "GruposConcepto",
    title: "Reporte de Grupos de Concepto",
  };

  return (
    <DataTable<ConceptGroupsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportAccGroups
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por descripción, código o tipo..."
    />
  );
}
