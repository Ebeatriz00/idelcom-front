import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import { buildSelectColumn, DataTable } from "@/layouts";
import { statusToBool, type ColumnSpec } from "@/sharedKernel";
import { confirmPdfLimit150 } from "@/sharedKernel/utils/export/confirmPdfLimit";
import { useExportActions } from "@/sharedKernel/utils/export/useExportActions";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power } from "lucide-react";
import { useMemo } from "react";
import { contactsGuards } from "../../utils/guards";
import { useContactsExportAll } from "./helper";

type PaginationState = { pageIndex: number; pageSize: number };

export function ContactsTable({
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
  data: ContactsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ContactsResponseDto) => void;
  onToggleStatus: (row: ContactsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}) {
  const { getAllOpporForExport, getForPdfLimit } = useContactsExportAll(search);

  const columns = useMemo<ColumnDef<ContactsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ContactsResponseDto>(),
      {
        accessorKey: "contactName",
        meta: { className: "whitespace-normal min-w-[180px]", label: "Contacto" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Contacto <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="py-1.5 overflow-hidden">
              <div className="float-right ml-2 mb-1">
                {isActive ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                    <BadgeCheck className="size-3" /> activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-100">
                    inactivo
                  </span>
                )}
              </div>
              <span className="font-medium text-gray-900 whitespace-normal leading-tight">
                {row.original.contactName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "clientsDescription",
        header: "Cuenta",
        cell: ({ getValue }) => (
          <div className="whitespace-normal leading-tight">
            {getValue() as string}
          </div>
        ),
        meta: { className: "hidden sm:table-cell min-w-[180px]", label: "Cuenta" },
      },
      {
        accessorKey: "workerDescritpion",
        header: "Vendedor",
        meta: { className: "hidden sm:table-cell min-w-[180px]", label: "Vendedor" },
      },
      {
        accessorKey: "jobTitle",
        header: "Cargo",
        meta: { className: "hidden md:table-cell min-w-[150px]", label: "Cargo" },
      },
      {
        accessorKey: "movil",
        header: "Móvil",
        meta: { className: "hidden md:table-cell min-w-[120px]", label: "Móvil" },
      },
      {
        accessorKey: "email",
        header: "Correo",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return (
            <div className="max-w-[290px] truncate" title={val}>
              {val}
            </div>
          );
        },
        meta: { className: "hidden lg:table-cell min-w-[250px]", label: "Correo" },
      },
      {
        accessorKey: "contactTypeDescription",
        header: "Tipo",
        meta: { className: "hidden lg:table-cell min-w-[120px]", label: "Tipo" },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = contactsGuards.isInUse(row.original);
          const _canToggle = contactsGuards.canToggle(row.original);

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
    [onEdit, onToggleStatus],
  );

  const colsExport: ColumnSpec<ContactsResponseDto>[] = [
    { label: "Contacto", value: (r) => r.contactName },
    { label: "Cuenta", value: (r) => r.clientsDescription },
    { label: "Vendedor", value: (r) => r.workerDescription },
    { label: "Cargo", value: (r) => r.jobTitle },
    { label: "Móvil", value: (r) => r.movil },
    { label: "Correo", value: (r) => r.email },
    { label: "Tipo", value: (r) => r.contactTypeDescription },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];
  const exportActions = useExportActions<ContactsResponseDto>({
    colsExport,
    opts: { filePrefix: "Contactos", title: "Reporte de Contactos" },
    getAllForExport: getAllOpporForExport,
    pdf: {
      limit: 150,
      entityLabel: "Contactos",
      getForPdf: (onPct) => getForPdfLimit(150, onPct),
      confirm: confirmPdfLimit150,
    },
  });

  return (
    <DataTable<ContactsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={{
        onCsv: exportActions.onCsv,
        onXlsx: exportActions.onXlsx,
        onPdf: exportActions.onPdf,
      }}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar... (contacto, cuenta, vendedor, cargo)"
    />
  );
}
