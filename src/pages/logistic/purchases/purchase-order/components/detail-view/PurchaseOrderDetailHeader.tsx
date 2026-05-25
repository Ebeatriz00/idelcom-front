import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  PackageCheck,
} from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import {
  isPurchaseOrderStatusIn,
  PURCHASE_ORDER_APPROVABLE_STATUS_IDS,
} from "../../utils/purchaseOrder.constants";
import { PurchaseOrderStatusBadge } from "../table/PurchaseOrderStatusBadge";
import {
  detailDate,
  detailMoney,
  detailValue,
  getPrimaryDetailAction,
} from "./purchaseOrderDetailView.helpers";

type Props = {
  order: PurchaseOrderGetByIdResponse;
  approving: boolean;
  onBack: () => void;
  onApprove: () => void;
  onRegisterReception: () => void;
  onViewReception: () => void;
};

function actionClass(intent: "primary" | "success" | "info") {
  const styles = {
    primary: "border-primary bg-primary text-white hover:bg-accent",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    info: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  };

  return [
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60",
    styles[intent],
  ].join(" ");
}

export function PurchaseOrderDetailHeader({
  order,
  approving,
  onBack,
  onApprove,
  onRegisterReception,
  onViewReception,
}: Props) {
  const canApprove = isPurchaseOrderStatusIn(
    order.purchaseOrderStatusId,
    PURCHASE_ORDER_APPROVABLE_STATUS_IDS,
  );
  const primaryAction = getPrimaryDetailAction(order.purchaseOrderStatusId);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-orange-50 p-1.5 text-primary">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-slate-950">
                #{order.purchaseOrderNumber ?? order.purchaseOrderId}
              </h1>
              <PurchaseOrderStatusBadge
                statusId={order.purchaseOrderStatusId}
                fallback={order.statusDescription}
              />
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {detailValue(order.supplierName)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Emisión</p>
                <p className="font-semibold text-slate-800">
                  {detailDate(order.purchaseOrderDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Moneda</p>
                <p className="font-semibold text-slate-800">
                  {detailValue(order.currencyDescription)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total</p>
                <p className="font-bold text-primary">
                  {detailMoney(order.total, order.currencyId)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Entrega</p>
                <p className="font-semibold text-slate-800">
                  {detailDate(order.expectedDeliveryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-start gap-2 xl:max-w-[520px] xl:justify-end">
          {primaryAction === "approve" ? (
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className={actionClass("primary")}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Aprobar orden
            </button>
          ) : null}
          {primaryAction === "receive" ? (
            <button
              type="button"
              onClick={onRegisterReception}
              className={actionClass("primary")}
            >
              <PackageCheck className="size-4" aria-hidden="true" />
              Registrar recepción
            </button>
          ) : null}
          {primaryAction === "view-receipt" ? (
            <button
              type="button"
              onClick={onViewReception}
              className={actionClass("info")}
            >
              <ClipboardCheck className="size-4" aria-hidden="true" />
              Ver recepción
            </button>
          ) : null}
          {canApprove && primaryAction !== "approve" ? (
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className={actionClass("success")}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Aprobar
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
