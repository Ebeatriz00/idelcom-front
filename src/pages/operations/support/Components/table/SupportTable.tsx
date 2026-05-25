import type { SupportResponseDto } from "@/application/dtos/operations/support/support.dto";
import { buildSelectColumn, DataTable, resolveStateColor } from "@/layouts";
import { exportCSV, exportExcel, exportPdf, useSupportStateOptions, type ColumnSpec } from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import type { PropsTable } from "../../utils/types";

export function SupportTable({
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
  const { data: supportStateResp } = useSupportStateOptions(1, "", 50);
  const supportStateOptions = useMemo(
    () => supportStateResp?.items ?? [],
    [supportStateResp]
  );

  const columns = useMemo<ColumnDef<SupportResponseDto>[]>(
    () => [
      buildSelectColumn<SupportResponseDto>(),
      {
        accessorKey: "provider",
        meta: { className: "whitespace-normal", label: "Proveedor" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Proveedor
          </button>
        ),
        cell: ({ row }) => {
          const stateValue = row.original.supportState;
          const stateItem = supportStateOptions.find((o) => Number(o.value) === stateValue);
          
          const stateLabel = stateItem ? stateItem.label : "Desconocido";
          const stateColor = stateItem ? stateItem.extraInfo : "neutral";

          const { className: bgClass, style: bgStyle } = resolveStateColor(stateColor, "bg");
          const { className: textClass, style: textStyle } = resolveStateColor(stateColor, "text");

          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-900 whitespace-normal">
                {row.original.provider}
              </span>
              <div>
                <span 
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${bgClass} ${textClass}`}
                  style={{ ...bgStyle, ...textStyle }}
                >
                  {stateLabel}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "service",
        meta: { className: "whitespace-normal", label: "Servicio" },
        header: () => <div>Servicio</div>,
      },
      {
        accessorKey: "url",
        meta: { className: "truncate max-w-[150px]", label: "Enlace" },
        header: () => <div>Enlace</div>,
        cell: ({ row }) => {
          const url = row.original.url;
          if (!url) return <span className="text-gray-400">-</span>;
          return (
            <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" className="text-gray-900 hover:text-blue-600 hover:underline truncate inline-block w-full max-w-[150px]" onClick={(e) => e.stopPropagation()} title={url}>
              {url}
            </a>
          );
        }
      },
      {
        accessorKey: "access",
        meta: { className: "truncate max-w-[150px]", label: "Acceso" },
        header: () => <div>Acceso</div>,
      },
      {
        accessorKey: "username",
        meta: { className: "truncate text-center", label: "Usuario" },
        header: () => <div className="text-center">Usuario</div>,
      },
      {
        accessorKey: "email",
        meta: { className: "truncate text-center", label: "Correo" },
        header: () => <div className="text-center">Correo</div>,
      },
      {
        accessorKey: "comments",
        meta: { className: "truncate max-w-[200px]", label: "Comentarios" },
        header: () => <div>Comentarios</div>,
        cell: ({ row }) => {
          const comments = row.original.comments;
          if (!comments) return <span className="text-gray-400">-</span>;
          return (
            <span className="truncate block w-full max-w-[200px]" title={comments}>
              {comments}
            </span>
          );
        }
      },
      {
        accessorKey: "expirationDate",
        meta: { className: "truncate text-center", label: "Vencimiento" },
        header: () => <div className="text-center">Vencimiento</div>,
        cell: ({ row }) => {
          const date = row.original.expirationDate;
          if (!date) return "N/A";
          // Evitar desfase de zona horaria (UTC a Local)
          const [year, month, day] = date.toString().split('T')[0].split('-');
          return `${day}/${month}/${year}`;
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
    [onEdit, onDelete, supportStateOptions],
  );

  const colsExport: ColumnSpec<SupportResponseDto>[] = [
    { label: "Proveedor", value: (row) => row.provider },
    { label: "Servicio", value: (row) => row.service },
    { label: "URL", value: (row) => row.url },
    { label: "Accesos", value: (row) => row.access },
    { label: "Correo", value: (row) => row.email },
    { label: "Usuario", value: (row) => row.username },
    { label: "Inicio", value: (row) => {
        if (!row.startDate) return "N/A";
        const [year, month, day] = row.startDate.toString().split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }},
    { label: "Vencimiento", value: (row) => {
        if (!row.expirationDate) return "N/A";
        const [year, month, day] = row.expirationDate.toString().split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }},
    { label: "Comentarios", value: (row) => row.comments },
    { label: "Observaciones", value: (row) => row.remarks },
  ];

  const opts = {
    filePrefix: "Apoyo_Operaciones",
    title: "Reporte de Apoyo de Operaciones",
  };

  return (
    <DataTable<SupportResponseDto>
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
      searchPlaceholder="Buscar por proveedor o servicio..."
    />
  );
}
