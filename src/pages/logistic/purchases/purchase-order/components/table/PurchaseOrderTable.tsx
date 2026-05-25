import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, ShoppingCart } from "lucide-react";
import { useMemo } from "react";

import type { PurchaseOrderResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { exportCSV, exportExcel, exportPdf, type ColumnSpec } from "@/sharedKernel";

import type { PropsTable } from "../../utils/purchaseOrder.type";
import {
  formatPurchaseOrderCurrencyValue,
  formatPurchaseOrderDate,
  getPurchaseOrderCurrencyBadgeClass,
  isPastPurchaseOrderDate,
  normalizePurchaseOrderCurrencyLabel,
} from "../../utils/purchaseOrder.table.helpers";
import { PurchaseOrderActionsMenu } from "./PurchaseOrderActionsMenu";
import {
  getPurchaseOrderStatusLabel,
  PurchaseOrderStatusBadge,
} from "./PurchaseOrderStatusBadge";


export function PurchaseOrderTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onSendForApproval,
  onApprove,
  onPrint,
  onCancel,
  onVisibleCountChange,
  canExport = true,
  loading = false,
}: PropsTable) {
  const columns = useMemo<ColumnDef<PurchaseOrderResponseDto, unknown>[]>(
    () => [
      buildSelectColumn<PurchaseOrderResponseDto>(),
      {
        accessorKey: "purchaseOrderNumber",
        meta: { className: "min-w-[150px]" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            # Orden <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="group flex items-center gap-2">
            <div className="rounded-md bg-orange-50 p-1.5 text-primary transition group-hover:bg-orange-100/70">
              <ShoppingCart className="size-3.5" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={() => onView(row.original)}
              className="rounded-md px-1 py-0.5 text-left text-sm font-semibold text-primary underline-offset-4 transition hover:bg-orange-50 hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
            >
              #{row.original.purchaseOrderNumber ?? row.original.purchaseOrderId}
            </button>
          </div>
        ),
      },
      {
        id: "supplier",
        meta: { className: "min-w-[240px] whitespace-normal" },
        header: "Proveedor",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {row.original.supplierName ?? "Sin nombre"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              RUC: {row.original.supplierDocumentNumber ?? "-"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "purchaseOrderDate",
        header: "Fecha",
        meta: { className: "min-w-[110px]" },
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {formatPurchaseOrderDate(row.original.purchaseOrderDate)}
          </span>
        ),
      },
      {
        accessorKey: "currencyDescription",
        header: "Moneda",
        meta: { className: "hidden lg:table-cell min-w-[100px]" },
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPurchaseOrderCurrencyBadgeClass(
              row.original.currencyId,
              row.original.currencyDescription,
            )}`}
          >
            {normalizePurchaseOrderCurrencyLabel(
              row.original.currencyId,
              row.original.currencyDescription,
            )}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        meta: { className: "min-w-[140px] text-right" },
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-semibold text-slate-950">
            {formatPurchaseOrderCurrencyValue(row.original.total ?? 0, row.original.currencyId)}
          </span>
        ),
      },
      {
        accessorKey: "statusDescription",
        header: "Estado",
        meta: { className: "min-w-[120px]" },
        cell: ({ row }) => (
          <PurchaseOrderStatusBadge
            statusId={row.original.purchaseOrderStatusId}
            fallback={row.original.statusDescription}
          />
        ),
      },
      {
        accessorKey: "expectedDeliveryDate",
        header: "Entrega esperada",
        meta: { className: "hidden xl:table-cell min-w-[165px]" },
        cell: ({ row }) => {
          const date = formatPurchaseOrderDate(row.original.expectedDeliveryDate);
          const overdue = isPastPurchaseOrderDate(row.original.expectedDeliveryDate);

          if (date === "-") {
            return <span className="text-sm text-slate-400">Sin fecha</span>;
          }

          if (overdue) {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <Calendar className="size-3.5" aria-hidden="true" />
                Vencida: {date}
              </span>
            );
          }

          return (
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Calendar className="size-3.5 text-slate-400" aria-hidden="true" />
              {date}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: {
          className:
            "w-[164px] text-right sticky right-0 z-20 bg-white shadow-[-8px_0_14px_-14px_rgba(15,23,42,0.45)] sm:static sm:z-auto sm:bg-transparent sm:shadow-none",
        },
        cell: ({ row }) => (
          <PurchaseOrderActionsMenu
            order={row.original}
            onView={onView}
            onEdit={onEdit}
            onSendForApproval={onSendForApproval}
            onApprove={onApprove}
            onPrint={onPrint}
            onCancel={onCancel}
          />
        ),
      },
    ],
    [onApprove, onCancel, onEdit, onPrint, onSendForApproval, onView],
  );

  const colsExport: ColumnSpec<PurchaseOrderResponseDto>[] = [
    { label: "# Orden", value: (row) => row.purchaseOrderNumber ?? String(row.purchaseOrderId) },
    { label: "Proveedor", value: (row) => row.supplierName ?? "" },
    { label: "RUC", value: (row) => row.supplierDocumentNumber ?? "" },
    { label: "Fecha", value: (row) => formatPurchaseOrderDate(row.purchaseOrderDate) },
    {
      label: "Moneda",
      value: (row) => normalizePurchaseOrderCurrencyLabel(row.currencyId, row.currencyDescription),
    },
    { label: "Subtotal", value: (row) => row.subtotal ?? 0 },
    { label: "IGV", value: (row) => row.taxAmount ?? 0 },
    { label: "Total", value: (row) => row.total ?? 0 },
    {
      label: "Estado",
      value: (row) =>
        getPurchaseOrderStatusLabel(
          row.purchaseOrderStatusId,
          row.statusDescription,
        ),
    },
    { label: "F. Entrega", value: (row) => formatPurchaseOrderDate(row.expectedDeliveryDate) },
  ];

  const opts = { filePrefix: "OrdenesDCompra", title: "Reporte de Órdenes de Compra" };

  return (
    <DataTable<PurchaseOrderResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      exportFns={
        canExport
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
      tableClassName="w-full min-w-[860px] table-auto text-sm"
      containerClassName="overflow-visible rounded-lg border border-slate-200 bg-white shadow-sm"
    />
  );
}

