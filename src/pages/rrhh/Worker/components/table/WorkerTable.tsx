import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";

import type { WorkerResponseDto } from "@/application";
import { DataTable, buildSelectColumn } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";

type PaginationState = { pageIndex: number; pageSize: number };

export function WorkersTable({
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
  canEditWorker = true,
  canEditStatusWorker = true,
  canExportWorker = true,
}: {
  data: WorkerResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: WorkerResponseDto) => void;
  onToggleStatus: (row: WorkerResponseDto) => void;
  onDelete: (row: WorkerResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditWorker?: boolean;
  canEditStatusWorker?: boolean;
  canExportWorker?: boolean;
}) {
  const columns = useMemo<ColumnDef<WorkerResponseDto, any>[]>(
    () => [
      {
        ...buildSelectColumn<WorkerResponseDto>(),
      },
      {
        accessorKey: "workerFullName",
        meta: { className: "flex-1 px-2 py-1 align-middle" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Trabajador <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          const fullName = row.original.workerFullName;
          const docType = row.original.documentType;

          return (
            <div className="flex items-start gap-2">
              <div>
                <span className="font-semibold text-gray-900">{fullName}</span>
                {}
                <div className="text-xs text-gray-500">{docType}</div>
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
        accessorKey: "workerDocument",
        header: () => <div className="text-center">N° Documento</div>,
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        accessorKey: "jobTitle",
        header: () => <div className="text-center">Cargo</div>,
        meta: {
          className: "hidden md:table-cell w-[200px] text-center align-middle",
        },
      },

      {
        accessorKey: "address",
        header: () => <div className="pr-8">Dirección</div>,
        meta: { className: "hidden lg:table-cell pr-8 align-middle" },
      },
      {
        accessorKey: "dateEntry",
        meta: {
          className: "hidden lg:table-cell w-[150px]",
          label: "Fecha de Ingreso",
        },
        header: () => <div className="pr-8">Fecha de Ingreso</div>,
        cell: ({ row }) => {
          const dateValue = row.original.dateEntry;

          if (!dateValue) {
            return "N/A";
          }

          const date = new Date(dateValue);
          return new Intl.DateTimeFormat("es-PE").format(date);
        },
      },

      {
        accessorKey: "district",
        meta: {
          className: "hidden xl:table-cell w-[180px]",
          label: "Distrito",
        },
        header: "Distrito",
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[100px]" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              {canEditWorker && (
              <button
                onClick={() => onEdit(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
              )}

              {canEditStatusWorker && (
              <button
                onClick={() => onToggleStatus(row.original)}
                className="rounded-md p-1.5 hover:bg-emerald-50"
                title={active ? "Inhabilitar" : "Habilitar"}
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
    [onEdit, onToggleStatus, onDelete, canEditWorker, canEditStatusWorker]
  );

  const colsExport: ColumnSpec<WorkerResponseDto>[] = [
    {
      label: "Nombres",
      value: (r) => r.workerFullName?.split(" ")[0] ?? "",
    },
    {
      label: "Apellidos",
      value: (r) => r.workerFullName?.split(" ").slice(1).join(" ") ?? "",
    },
    { label: "Documento", value: (r) => r.workerDocument ?? "" },
    { label: "Cargo", value: (r) => r.jobTitleId ?? "N/A" },
    { label: "Dirección", value: (r) => r.address ?? "" },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Trabajadores", title: "Reporte de Trabajadores" };

  return (
    <DataTable<WorkerResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportWorker ? {
        onCsv: (rows) => exportCSV(rows, colsExport, opts),
        onXlsx: (rows) => exportExcel(rows, colsExport, opts),
        onPdf: (rows) => exportPdf(rows, colsExport, opts),
      } 
      : undefined
      }
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por nombre, apellido o documento..."
    />
  );
}
