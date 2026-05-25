import { ClipboardCheck, PackageCheck, ReceiptText } from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import {
  detailMoney,
  getReceivedSummary,
} from "./purchaseOrderDetailView.helpers";

export function PurchaseOrderSummaryCard({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  const reception = getReceivedSummary(order);
  const receptionLabel =
    reception.quantity === 0
      ? "Sin productos"
      : reception.progress >= 100
        ? "Recibida total"
        : reception.received > 0
          ? "Recepción parcial"
          : "Sin recibir";

  return (
    <aside>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md bg-orange-50 p-1.5 text-primary">
            <ReceiptText className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Resumen</h2>
            <p className="text-xs text-slate-500">Montos y avance operativo.</p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">{detailMoney(order.subtotal, order.currencyId)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Descuento total</span>
            <span className="font-medium tabular-nums">{detailMoney(order.discountAmount, order.currencyId)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>IGV</span>
            <span className="font-medium tabular-nums">{detailMoney(order.taxAmount, order.currencyId)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</span>
              <span className="text-2xl font-bold text-primary tabular-nums">
                {detailMoney(order.total, order.currencyId)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-100 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <PackageCheck className="size-4 text-slate-500" aria-hidden="true" />
                {receptionLabel}
              </div>
              <span className="text-xs font-semibold text-slate-500">{reception.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${reception.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {reception.received} / {reception.quantity} unidades recibidas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Productos</p>
              <p className="text-lg font-bold text-slate-900">{order.details.length}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Monto pendiente</p>
              <p className="text-sm font-bold text-slate-900">
                {detailMoney(reception.pendingAmount, order.currencyId)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <ClipboardCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Seguimiento calculado con cantidades recibidas y pendientes disponibles en la OC.
          </div>
        </div>
      </section>
    </aside>
  );
}
