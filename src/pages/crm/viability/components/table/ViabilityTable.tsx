import { buildSelectColumn, DataTable, makeStateBadgeCell } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Eye, Gavel, Power } from "lucide-react";
import { useMemo } from "react";
import type { Viability } from "@/application/dtos/crm/viability/Viability.dto";

type PaginationState = { pageIndex: number; pageSize: number };

export function ViabilityTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onProcessDecision,
  onView,
  onVisibleCountChange,
  search,
  onSearchChange,
}: {
  data: Viability[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: Viability) => void;
  onToggleStatus: (row: Viability) => void;
  onProcessDecision: (row: Viability) => void;
  onView: (row: Viability) => void; 
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}) {
  const columns = useMemo<ColumnDef<Viability, any>[]>(
    () => [
      buildSelectColumn<Viability>(),
      {
        accessorKey: "opporNum",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nro. Oportunidad <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.opporNum}
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
        accessorKey: "opporDesc",
        header: "Descripción",
        meta: { className: "hidden sm:table-cell", label: "Descripción" },
      },
      {
        accessorKey: "clientsName",
        header: "Cliente",
        meta: { className: "hidden md:table-cell", label: "Cliente" },
      },
      {
            accessorKey: "generalStatesName",
            header: () => <div className="text-center">Etapa General</div>,
            meta: {
              className: "hidden md:table-cell w-[140px] text-center align-middle",
            },
            cell: makeStateBadgeCell({
              descField: "generalStatesName",
              colorField: "colorState",
            }),
      },

      {
            accessorKey: "oporStatesName",
            header: () => <div className="text-center">Etapa Comercial</div>,
            meta: {
              className: "hidden md:table-cell w-[140px] text-center align-middle",
            },
            cell: makeStateBadgeCell({
              descField: "oporStatesName",
              colorField: "oporColorState",
            }),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[140px] text-right sticky right-0 bg-gray-50 border-l" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const canProcess = active;

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              
              {/* BOTÓN 1: VER DETALLE (OJO) */}
              <button
                onClick={() => onView(row.original)}
                className="rounded-md p-1.5 hover:bg-blue-50 text-blue-600 transition-colors"
                title="Ver análisis de viabilidad"
              >
                <Eye className="size-4" />
              </button>

              {/* BOTÓN 2: PROCESAR (MARTILLO) */}
              <button
                onClick={() => canProcess && onProcessDecision(row.original)}
                disabled={!canProcess}
                className="rounded-md p-1.5 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Procesar Decisión (Aprobar/Rechazar)"
              >
                <Gavel className={`size-4 ${canProcess ? "text-orange-600" : "text-gray-400"}`} />
              </button>

              {/* BOTÓN 3: ESTADO (POWER) */}
              <button
                onClick={() => onToggleStatus(row.original)}
                className="rounded-md p-1.5 hover:bg-emerald-50"
                title={active ? "Desactivar" : "Activar"}
              >
                <Power className={`size-4 ${active ? "text-emerald-600" : "text-gray-400"}`} />
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onToggleStatus, onProcessDecision, onView]
  );

  const colsExport: ColumnSpec<Viability>[] = [
    { label: "Nro", value: (r) => r.opporNum },
    { label: "Descripción", value: (r) => r.opporDesc },
    { label: "Cliente", value: (r) => r.clientsName },    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "PreOportunidades",
    title: "Reporte de Pre-Oportunidades (Viabilidad)",
  };

  return (
    <DataTable<Viability>
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
      searchPlaceholder="Buscar por nro, descripción o cliente..."
    />
  );
}