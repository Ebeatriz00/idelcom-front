import type { PurchaseOrderGetByIdResponse } from "@/application";

import {
  detailMoney,
  getLineReceptionStatus,
} from "./purchaseOrderDetailView.helpers";

export function PurchaseOrderLinesTable({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Líneas de detalle</h2>
          <p className="text-xs text-slate-500">
            {order.details.length} producto{order.details.length === 1 ? "" : "s"} asociado
            {order.details.length === 1 ? "" : "s"} a la orden.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[1040px] w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 text-left">Producto</th>
              <th className="px-3 py-3 text-right">Cantidad</th>
              <th className="px-3 py-3 text-right">Precio unitario</th>
              <th className="px-3 py-3 text-right">Desc. %</th>
              <th className="px-3 py-3 text-left">Impuesto</th>
              <th className="px-3 py-3 text-right">Subtotal</th>
              <th className="px-3 py-3 text-right">Precio con IGV</th>
              <th className="px-3 py-3 text-left">Recepción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.details.map((detail, index) => {
              const reception = getLineReceptionStatus(detail);
              const quantity = Number(detail.quantity ?? 0);
              const received = Number(detail.receivedQuantity ?? 0);

              return (
                <tr key={detail.purchaseOrderDetailId ?? index} className="hover:bg-orange-50/20">
                  <td className="px-3 py-3 align-top">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      SKU no registrado
                    </p>
                    <p className="max-w-[320px] font-semibold text-slate-900" title={detail.productDescription ?? ""}>
                      {detail.productDescription ?? `Producto #${detail.productsId}`}
                    </p>
                    {detail.observation ? (
                      <p className="max-w-[320px] truncate text-xs text-slate-500" title={detail.observation}>
                        {detail.observation}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-right align-top font-semibold tabular-nums text-slate-800">
                    {quantity.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
                    {detail.uomDescription ? (
                      <span className="ml-1 text-xs font-medium text-slate-500">{detail.uomDescription}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-right align-top tabular-nums">
                    {detailMoney(detail.unitPrice, order.currencyId)}
                  </td>
                  <td className="px-3 py-3 text-right align-top tabular-nums">
                    {Number(detail.discountPercent ?? 0).toFixed(2)}%
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                      {Number(detail.igvPercent ?? 0) > 0 ? `IGV ${detail.igvPercent}%` : "Sin IGV"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right align-top font-semibold tabular-nums text-slate-800">
                    {detailMoney(detail.subtotal, order.currencyId)}
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <span className={detail.priceIncludesTax ? "font-semibold text-emerald-700" : "text-slate-500"}>
                      {detail.priceIncludesTax ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${reception.className}`}>
                      {reception.label}
                    </span>
                    <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${reception.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{received} / {quantity} recibido</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}


