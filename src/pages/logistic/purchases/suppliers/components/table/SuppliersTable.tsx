import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

import type { SuppliersResponseDto } from "@/application";
import { StatusBadge } from "@/layouts/components/ui/status-badge";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  type ColumnSpec,
} from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";

import type { PropsTable } from "../../utils/suppliers.type";

function getStatusView(status: SuppliersResponseDto["status"]) {
  const raw = String(status ?? "").trim().toLowerCase();
  if (raw.includes("observ")) {
    return { label: "Observado", intent: "warning" as const };
  }
  if (statusToBool(status)) {
    return { label: "Activo", intent: "success" as const };
  }
  return { label: "Inactivo", intent: "neutral" as const };
}

function EmptyText({ value }: { value?: string | number | null }) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">Sin registrar</span>;
  }
  return <span>{value}</span>;
}

function getLocationDescription(row: SuppliersResponseDto) {
  return (
    row.districtDescription ??
    row.provinceDescription ??
    row.departmentDescription ??
    ""
  );
}

export function SuppliersTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  canExportSuppliers = true,
  canEditSuppliers = true,
  canEditStatusSuppliers = true,
  canDeleteSuppliers = false,
  loading = false,
}: PropsTable) {
  const columns = useMemo<ColumnDef<SuppliersResponseDto, unknown>[]>(
    () => [
      buildSelectColumn<SuppliersResponseDto>(),
      {
        accessorKey: "supplierName",
        meta: { className: "min-w-[260px] whitespace-normal" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Proveedor <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const supplier = row.original;
          const status = getStatusView(supplier.status);
          return (
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-primary-degrad p-2 text-primary">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary">
                    {supplier.supplierName ?? "Proveedor sin nombre"}
                  </span>
                  <StatusBadge intent={status.intent}>{status.label}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Documento: {supplier.documentNumber ?? "sin registrar"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "suppliersGroupDesc",
        header: "Grupo",
        meta: { className: "min-w-[150px] whitespace-normal" },
        cell: ({ row }) => (
          <EmptyText
            value={
              row.original.suppliersGroupDesc ??
              row.original.suppliersGroupsDescription
            }
          />
        ),
      },
      {
        accessorKey: "contactName",
        header: "Contacto",
        meta: { className: "min-w-[180px] whitespace-normal" },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium text-secondary">
              <EmptyText value={row.original.contactName} />
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              <EmptyText value={row.original.email} />
            </p>
          </div>
        ),
      },
      {
        id: "phone",
        header: "Telefonos",
        meta: { className: "hidden lg:table-cell min-w-[150px] whitespace-normal" },
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-secondary">
            <p className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              <EmptyText value={row.original.phone} />
            </p>
            <p className="text-xs text-muted-foreground">
              Movil: {row.original.mobile ?? row.original.movil ?? "sin registrar"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Ubicacion",
        meta: { className: "hidden xl:table-cell min-w-[240px] whitespace-normal" },
        cell: ({ row }) => {
          const locationDescription = getLocationDescription(row.original);

          return (
            <div className="min-w-0 text-sm text-secondary">
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>{row.original.address ?? "Sin direccion registrada"}</span>
              </p>
              {locationDescription ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {locationDescription}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "payment",
        header: "Pago",
        meta: { className: "hidden xl:table-cell min-w-[180px] whitespace-normal" },
        cell: ({ row }) => (
          <div className="text-sm text-secondary">
            <p>
              <EmptyText
                value={
                  row.original.paymentConditionDesc ??
                  row.original.paymentTypeDescription
                }
              />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.paymentMethodDesc ??
                row.original.paymentMethodDescription ??
                "Metodo pendiente"}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[128px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {canEditSuppliers ? (
                <button
                  type="button"
                  onClick={() => onEdit(row.original)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary-degrad hover:text-primary"
                  title="Editar proveedor"
                >
                  <Pencil className="size-4" />
                </button>
              ) : null}
              {canEditStatusSuppliers ? (
                <button
                  type="button"
                  onClick={() => onToggleStatus(row.original)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary-degrad hover:text-primary"
                  title={active ? "Desactivar proveedor" : "Activar proveedor"}
                >
                  {active ? (
                    <BadgeCheck className="size-4 text-accent" />
                  ) : (
                    <Power className="size-4 text-muted-foreground" />
                  )}
                </button>
              ) : null}
              {canDeleteSuppliers ? (
                <button
                  type="button"
                  onClick={() => onDelete(row.original)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  title="Eliminar proveedor"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      canDeleteSuppliers,
      canEditStatusSuppliers,
      canEditSuppliers,
      onDelete,
      onEdit,
      onToggleStatus,
    ],
  );

  const colsExport: ColumnSpec<SuppliersResponseDto>[] = [
    { label: "Documento", value: (row) => row.documentNumber ?? "" },
    { label: "Proveedor", value: (row) => row.supplierName ?? "" },
    { label: "Grupo", value: (row) => row.suppliersGroupDesc ?? "" },
    { label: "Contacto", value: (row) => row.contactName ?? "" },
    { label: "Direccion", value: (row) => row.address ?? "" },
    { label: "Telefono", value: (row) => row.phone ?? "" },
    { label: "Movil", value: (row) => row.mobile ?? row.movil ?? "" },
    { label: "Correo", value: (row) => row.email ?? "" },
    { label: "Tipo pago", value: (row) => row.paymentConditionDesc ?? "" },
    { label: "Metodo pago", value: (row) => row.paymentMethodDesc ?? "" },
    { label: "Estado", value: (row) => getStatusView(row.status).label },
  ];

  const opts = { filePrefix: "Proveedores", title: "Reporte de Proveedores" };

  return (
    <DataTable<SuppliersResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExportSuppliers
          ? {
              onCsv: (rows) => exportCSV(rows, colsExport, opts),
              onXlsx: (rows) => exportExcel(rows, colsExport, opts),
              onPdf: (rows) => exportPdf(rows, colsExport, opts),
            }
          : undefined
      }
      hideSearch
      loading={loading}
      columnsMenuLabel="Columnas"
      tableClassName="w-full table-auto text-sm"
    />
  );
}
