import type { ConceptsResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
} from "@/sharedKernel";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { conceptsGuards } from "../../utils/guards";


type PaginationState = { pageIndex: number; pageSize: number };

export function ConceptsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onVisibleCountChange,
  search,
  onSearchChange,
  canEditConcept = true,
  canEditStatusConcept = true,
  canExportConcept = true,
}: {
  data: ConceptsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: ConceptsResponseDto) => void;
  onToggleStatus: (row: ConceptsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditConcept?: boolean;
  canEditStatusConcept?: boolean;
  canExportConcept?: boolean;
  onDelete: (row: ConceptsResponseDto) => void;
}) {
  const columns = useMemo<ColumnDef<ConceptsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ConceptsResponseDto>(),
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
        accessorKey: "conceptGroupsDescription",
        header: "Grupo de Concepto",
        meta: { className: "hidden sm:table-cell", label: "Grupo de Concepto" },
      },
      {
        accessorKey: "accountPlanDescription",
        header: "Cuenta Contable",
        meta: { className: "hidden sm:table-cell", label: "Cuenta Contable" },
      },
      {
        accessorKey: "conceptsCount",
        meta: {
          className: "hidden md:table-cell whitespace-nowrap text-right",
          label: "Uso",
        },
        header: "En Uso",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-end w-full gap-1 text-gray-700">
            {row.original.conceptsCount ?? 0}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = conceptsGuards.isInUse(row.original);
          const _canToggle = conceptsGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditConcept && (
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              )}
              {canEditStatusConcept && (
              <button
                onClick={() => _canToggle && onToggleStatus(row.original)}
                disabled={!_canToggle}
                className="rounded-md p-1.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
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
    [onEdit, onDelete, onToggleStatus, canEditConcept, canEditStatusConcept]
  );

  const colsExport: ColumnSpec<ConceptsResponseDto>[] = [
    { label: "Descripción", value: (r) => r.description },
    { label: "Grupo de Concepto", value: (r) => r.conceptGroupsDescription },
    { label: "Cuenta Contable", value: (r) => r.accountPlanDescription },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Conceptos",
    title: "Reporte de Conceptos",
  };

  return (
    <DataTable<ConceptsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportConcept ? {
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      } 
      : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar... (descripción, grupo, cuenta)"
    />
  );
}