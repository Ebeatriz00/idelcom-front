import type { ClinicResponseDto } from "@/application/dtos/operations/clinics/clinic.dto";
import { buildSelectColumn, DataTable } from "@/layouts";
import { exportCSV, exportExcel, exportPdf, type ColumnSpec, statusToBool } from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Pencil, Trash2Icon } from "lucide-react";
import { useMemo } from "react";

export interface PropsTable {
  data: ClinicResponseDto[];
  total: number;
  pageCount: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: any;
  onEdit: (row: ClinicResponseDto) => void;
  onDelete: (row: ClinicResponseDto) => void;
  search: string;
  onSearchChange: (val: string) => void;
  canExport?: boolean;
}

export function ClinicTable({
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
  const columns = useMemo<ColumnDef<ClinicResponseDto>[]>(
    () => [
      buildSelectColumn<ClinicResponseDto>(),
      {
        accessorKey: "clinicName",
        meta: { className: "whitespace-normal", label: "Nombre" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre de la Clínica
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 whitespace-normal">
                {row.original.clinicName}
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
        accessorKey: "documentNumber",
        meta: { className: "whitespace-normal", label: "Documento" },
        header: () => <div>Nro. Documento</div>,
        cell: ({ row }) => {
          const doc = row.original.documentNumber;
          return doc ? doc : <span className="text-gray-400">-</span>;
        }
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
                className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>

              <button
                onClick={() => onDelete(row.original)}
                className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500 hover:text-rose-600"
                title="Inactivar / Eliminar"
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

  const colsExport: ColumnSpec<ClinicResponseDto>[] = [
    { label: "Nombre", value: (row) => row.clinicName },
    { label: "Documento", value: (row) => row.documentNumber ?? "" },
    { label: "Estado", value: (row) => statusToBool(row.status) ? "Activo" : "Inactivo" },
  ];

  const opts = {
    filePrefix: "Clinicas_SSOMA",
    title: "Reporte de Clínicas SSOMA",
  };

  return (
    <DataTable<ClinicResponseDto>
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
      searchPlaceholder="Buscar por nombre o documento..."
    />
  );
}
