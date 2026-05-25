import type { TasksProjectResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { tasksProjectGuards } from "../../utils/guards";




type PaginationState = { pageIndex: number; pageSize: number };

export function TasksProjectTable({
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
  data: TasksProjectResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: TasksProjectResponseDto) => void;
  onToggleStatus: (row: TasksProjectResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}) {
  const columns = useMemo<ColumnDef<TasksProjectResponseDto, any>[]>(
    () => [
      buildSelectColumn<TasksProjectResponseDto>(),
      {
        accessorKey: "title",
        meta: { className: "truncate", label: "Título" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.title}
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
        accessorKey: "projectDescription",
        header: "Proyecto",
        meta: { className: "hidden sm:table-cell", label: "Proyecto" },
      },
      {
        accessorKey: "stateTaskDescription",
        header: "Estado Tarea",
        meta: { className: "hidden md:table-cell", label: "Estado Tarea" },
      },
      {
        accessorKey: "wprkerDescription",
        header: "Responsable",
        meta: { className: "hidden lg:table-cell", label: "Responsable" },
      },
      {
        accessorKey: "priorityStateDescription",
        header: "Prioridad",
        meta: { className: "hidden sm:table-cell", label: "Prioridad" },
      },
      {
        accessorKey: "endDate",
        header: "Vence",
        meta: { className: "hidden md:table-cell", label: "Vence" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {}
            {row.original.endDate ? new Date(row.original.endDate.toString()).toLocaleDateString() : "N/A"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = tasksProjectGuards.isInUse(row.original); 
          const _canToggle = tasksProjectGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                aria-label="Editar"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
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
            </div>
          );
        },
      },
    ],
    [onEdit, onToggleStatus]
  );

  const colsExport: ColumnSpec<TasksProjectResponseDto>[] = [
    { label: "Título", value: (r) => r.title },
    { label: "Oportunidad", value: (r) => r.projectDescription },
    { label: "Estado Tarea", value: (r) => r.stateTaskDescription },
    { label: "Responsable", value: (r) => r.wprkerDescription },
    { label: "Prioridad", value: (r) => r.priorityStateDescription },
    { label: "Vence", value: (r) => r.endDate?.toString() ?? '' },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = {
    filePrefix: "Tareas",
    title: "Reporte de Tareas",
  };

  return (
    <DataTable<TasksProjectResponseDto>
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
      searchPlaceholder="Buscar... (título, oportunidad, estado, etc.)"
    />
  );
}