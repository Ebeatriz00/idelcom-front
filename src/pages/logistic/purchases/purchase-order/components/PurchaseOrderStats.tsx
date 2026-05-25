import type { PurchaseOrderResponseDto } from "@/application";
import { AlertCircle, Ban, CheckCircle2, ClipboardList, Coins } from "lucide-react";
import { PURCHASE_ORDER_STATUS_ID } from "../utils/purchaseOrder.constants";

type Props = {
  rows: PurchaseOrderResponseDto[];
  total: number;
};

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PurchaseOrderStats({ rows, total }: Props) {
  const pending = rows.filter(
    (row) => row.purchaseOrderStatusId === PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL,
  ).length;
  const cancelled = rows.filter(
    (row) => row.purchaseOrderStatusId === PURCHASE_ORDER_STATUS_ID.CANCELLED,
  ).length;
  const received = rows.filter(
    (row) => row.purchaseOrderStatusId === PURCHASE_ORDER_STATUS_ID.FULLY_RECEIVED,
  ).length;
  const amountByCurrency = rows.reduce(
    (acc, row) => {
      if (row.currencyId === 1) {
        acc.dollars += Number(row.total ?? 0);
        return acc;
      }

      acc.soles += Number(row.total ?? 0);
      return acc;
    },
    { soles: 0, dollars: 0 },
  );

  const stats = [
    { label: "Total órdenes", value: total, icon: ClipboardList },
    { label: "Pendientes de aprobación", value: pending, icon: AlertCircle },
    { label: "Recibidas total", value: received, icon: CheckCircle2 },
    { label: "Anuladas", value: cancelled, icon: Ban },
    {
      label: "Monto total filtrado",
      value: (
        <span className="flex flex-col gap-0.5 leading-tight">
          <span>S/. {currencyFormatter.format(amountByCurrency.soles)}</span>
          <span>US$ {currencyFormatter.format(amountByCurrency.dollars)}</span>
        </span>
      ),
      icon: Coins,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {stat.value}
                </p>
              </div>
              <span className="rounded-md bg-slate-100 p-1.5 text-slate-500">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

