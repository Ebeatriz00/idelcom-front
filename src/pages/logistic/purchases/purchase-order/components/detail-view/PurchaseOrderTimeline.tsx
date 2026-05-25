import { Check, Circle, XCircle } from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import {
  PURCHASE_ORDER_STATUS_ID,
  PURCHASE_ORDER_STATUS_CONFIG,
} from "../../utils/purchaseOrder.constants";
import { detailDate } from "./purchaseOrderDetailView.helpers";

type TimelineStage = {
  label: string;
  statusIds: number[];
};

const stages: TimelineStage[] = [
  { label: "Creada", statusIds: [PURCHASE_ORDER_STATUS_ID.DRAFT] },
  { label: "Pendiente de aprobación", statusIds: [PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL] },
  { label: "Aprobada", statusIds: [PURCHASE_ORDER_STATUS_ID.APPROVED, PURCHASE_ORDER_STATUS_ID.SENT_TO_SUPPLIER] },
  { label: "Recepción parcial", statusIds: [PURCHASE_ORDER_STATUS_ID.PARTIALLY_RECEIVED] },
  { label: "Recibida total", statusIds: [PURCHASE_ORDER_STATUS_ID.FULLY_RECEIVED] },
  { label: "Facturada", statusIds: [PURCHASE_ORDER_STATUS_ID.PARTIALLY_INVOICED, PURCHASE_ORDER_STATUS_ID.FULLY_INVOICED] },
  { label: "Cerrada", statusIds: [PURCHASE_ORDER_STATUS_ID.CLOSED] },
];

function getCurrentIndex(statusId: number) {
  const index = stages.findIndex((stage) => stage.statusIds.includes(statusId));
  return index >= 0 ? index : 0;
}

export function PurchaseOrderTimeline({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  const isCancelled =
    order.purchaseOrderStatusId === PURCHASE_ORDER_STATUS_ID.CANCELLED ||
    order.purchaseOrderStatusId === PURCHASE_ORDER_STATUS_ID.REJECTED;
  const currentIndex = getCurrentIndex(order.purchaseOrderStatusId);
  const statusConfig =
    PURCHASE_ORDER_STATUS_CONFIG[
      order.purchaseOrderStatusId as keyof typeof PURCHASE_ORDER_STATUS_CONFIG
    ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-950">Trazabilidad</h2>
        <p className="text-xs text-slate-500">Estado operativo de la orden de compra.</p>
      </div>

      {isCancelled ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <XCircle className="size-4" aria-hidden="true" />
            {statusConfig?.label ?? order.statusDescription ?? "Anulada"}
          </div>
          <p className="mt-1 text-xs text-rose-600">
            La orden quedó en solo lectura. Emisión: {detailDate(order.purchaseOrderDate)}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ol className="grid min-w-[720px] grid-cols-7 gap-2">
            {stages.map((stage, index) => {
              const completed = index < currentIndex;
              const current = index === currentIndex;
              const date =
                stage.label === "Creada"
                  ? detailDate(order.purchaseOrderDate)
                  : stage.label === "Aprobada"
                    ? detailDate(order.approvedAt)
                    : null;

              return (
                <li key={stage.label} className="relative">
                  <div
                    className={[
                      "rounded-lg border p-3",
                      current
                        ? "border-orange-200 bg-orange-50"
                        : completed
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mb-2 flex size-6 items-center justify-center rounded-full border",
                        current
                          ? "border-primary bg-primary text-white"
                          : completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-slate-400",
                      ].join(" ")}
                    >
                      {completed ? <Check className="size-3.5" /> : <Circle className="size-3" />}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{stage.label}</p>
                    {date ? <p className="mt-1 text-[11px] text-slate-500">{date}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
