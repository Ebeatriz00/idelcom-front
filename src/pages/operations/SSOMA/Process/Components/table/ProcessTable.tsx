import type { SsomaProcessResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck } from "lucide-react";
import { useMemo } from "react";
import type { PropsTable } from "../../utils/types";

export function ProcessTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
  canExport = true,
}: PropsTable) {
  const formatBool = (value?: boolean) => (value ? "Sí" : "No");

  const columns = useMemo<ColumnDef<SsomaProcessResponseDto>[]>(
    () => [
      buildSelectColumn<SsomaProcessResponseDto>(),
      {
        accessorKey: "name",
        meta: { className: "whitespace-normal", label: "Proyecto" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Proyecto
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);

          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-900 whitespace-normal leading-snug">
                {row.original.operationsName}
              </span>

              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isActive && <BadgeCheck className="size-3" />}
                {isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "requiresCompanyHomologation",
        meta: {
          className: "text-center",
          label: "Homologación empresarial?",
        },
        header: () => <div className="text-center">Homologación Empresarial?</div>,
        cell: ({ row }) => (
          <span className="font-medium text-slate-700">
            {formatBool(row.original.requiresCompanyHomologation)}
          </span>
        ),
      },
      {
        accessorKey: "requieresOperationTeamSsoma",
        meta: { className: "text-center", label: "Requiere Ssoma?" },
        header: () => <div className="text-center">Requiere Ssoma?</div>,
        cell: ({ row }) => (
          <span className="font-medium text-slate-700">
            {formatBool(row.original.requieresOperationTeamSsoma)}
          </span>
        ),
      },
      {
        accessorKey: "requestDate",
        header: () => <div className="text-center">Fec. Solicitud</div>,
        meta: { className: "hidden lg:table-cell", label: "Fec. Solicitud" },
        cell: ({ row }) => {
          if (!row.original.requestDate)
            return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">
                {new Date(row.original.requestDate).toLocaleDateString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: () => <div className="text-center">Fec. Inicio</div>,
        meta: { className: "hidden lg:table-cell", label: "Fec. Inicio" },
        cell: ({ row }) => {
          if (!row.original.startDate)
            return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">
                {new Date(row.original.startDate).toLocaleDateString()}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: "endDate",
        header: () => <div className="text-center">Fec. Fin</div>,
        meta: { className: "hidden lg:table-cell", label: "Fec. Fin" },
        cell: ({ row }) => {
          if (!row.original.endDate)
            return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">
                {new Date(row.original.endDate).toLocaleDateString()}
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );
  const colsExport: ColumnSpec<SsomaProcessResponseDto>[] = [
    { label: "Proyecto", value: (row) => row.operationsName },
    { label: "Estado", value: (row) => row.currentDesc },
    {
      label: "Homologación Empresarial?",
      value: (row) => (row.requiresCompanyHomologation ? "Sí" : "No"),
    },
    {
      label: "Requiere Ssoma?",
      value: (row) => (row.requieresOperationTeamSsoma ? "Sí" : "No"),
    },
    { label: "Fec. Inicio", value: (row) => row.startDate },
    { label: "Fec. Fin", value: (row) => row.endDate },
  ];

  const opts = {
    filePrefix: "Procesos SSOMA",
    title: "Reporte de Procesos SSOMA",
  };
  return (
    <DataTable<SsomaProcessResponseDto>
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
