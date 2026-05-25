import type { WarehousesMovementResponseDto } from "@/application";
import { StatusBadge } from "@/layouts/components/ui/status-badge";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { statusToBool } from "@/sharedKernel";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ClipboardList, PackagePlus, Warehouse } from "lucide-react";
import { useMemo } from "react";
import type { IncomesTableProps } from "../../types/income.types";
import { dateText, money } from "../../utils/formatters";

function getStatusView(status: WarehousesMovementResponseDto["status"]) {
  const raw = String(status ?? "").trim().toLowerCase();
  if (raw.includes("observ")) {
    return { label: "Observado", intent: "warning" as const };
  }
  if (statusToBool(status)) {
    return { label: "Activo", intent: "success" as const };
  }
  return { label: status || "Registrado", intent: "neutral" as const };
}

function EmptyText({ value }: { value?: string | number | null }) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">Sin registrar</span>;
  }
  return <span>{value}</span>;
}

export function IncomesTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
  loading,
  filtersSlot,
  onView,
}: IncomesTableProps) {
  const columns = useMemo<ColumnDef<WarehousesMovementResponseDto, unknown>[]>(
    () => [
      buildSelectColumn<WarehousesMovementResponseDto>(),
      {
        accessorKey: "movementDate",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha <ArrowUpDown className="size-3.5" />
          </button>
        ),
        meta: { className: "min-w-[130px]" },
        cell: ({ row }) => (
          <span className="font-semibold text-secondary">
            {dateText(row.original.movementDate)}
          </span>
        ),
      },
      {
        id: "document",
        header: "Documento",
        meta: { className: "min-w-[150px]" },
        cell: ({ row }) => {
          const document = [row.original.series, row.original.numberDocument]
            .filter(Boolean)
            .join("-");
          return (
            <span className="font-semibold text-secondary">
              {document || row.original.referenceDocument || "Sin documento"}
            </span>
          );
        },
      },
      {
        accessorKey: "movementTypeDescription",
        header: "Tipo de ingreso",
        meta: { className: "min-w-[260px] whitespace-normal" },
        cell: ({ row }) => {
          const item = row.original;
          const status = getStatusView(item.status);
          return (
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-primary-degrad p-2 text-primary">
                <PackagePlus className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary">
                    {item.movementTypeDescription ?? "Ingreso sin tipo"}
                  </span>
                  <StatusBadge intent={status.intent}>{status.label}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Operacion: {item.movOperDescription ?? "INGRESO"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "warehouseDescription",
        header: "Almacen",
        meta: { className: "min-w-[200px] whitespace-normal" },
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-secondary">
            <Warehouse className="size-3.5 text-muted-foreground" />
            <EmptyText value={row.original.warehouseDescription} />
          </div>
        ),
      },
      {
        accessorKey: "supplierName",
        header: "Proveedor",
        meta: { className: "min-w-[220px] whitespace-normal" },
        cell: ({ row }) => (
          <p className="font-medium text-secondary">
            <EmptyText value={row.original.supplierName} />
          </p>
        ),
      },
      {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        meta: { className: "min-w-[130px] text-right" },
        cell: ({ row }) => (
          <span className="font-semibold text-secondary">
            {money(row.original.total)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        meta: { className: "hidden xl:table-cell min-w-[120px]" },
        cell: ({ row }) => {
          const status = getStatusView(row.original.status);
          return <StatusBadge intent={status.intent}>{status.label}</StatusBadge>;
        },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[96px] text-right" },
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onView(row.original)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-degrad hover:text-primary"
            aria-label="Ver detalle del ingreso"
            title="Ver detalle del ingreso"
          >
            <ClipboardList className="size-4" />
          </button>
        ),
      },
    ],
    [onView],
  );

  return (
    <DataTable<WarehousesMovementResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      hideSearch
      searchValue={search}
      onSearchChange={onSearchChange}
      loading={loading}
      datePickerSlot={filtersSlot}
      columnsMenuLabel="Vista"
      tableClassName="w-full table-auto text-sm"
    />
  );
}
