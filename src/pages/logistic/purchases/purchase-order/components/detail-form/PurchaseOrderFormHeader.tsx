import { ArrowLeft, ShoppingCart } from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import { PurchaseOrderStatusBadge } from "../table/PurchaseOrderStatusBadge";

type PurchaseOrderFormHeaderProps = {
  pageTitle: string;
  isCreate: boolean;
  existingOrder?: PurchaseOrderGetByIdResponse;
  onBack: () => void;
};

export function PurchaseOrderFormHeader({
  pageTitle,
  isCreate,
  existingOrder,
  onBack,
}: PurchaseOrderFormHeaderProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-orange-50 p-1.5 text-primary">
                <ShoppingCart className="size-4" aria-hidden="true" />
              </span>
              <h1 className="text-xl font-semibold text-slate-950">
                {pageTitle}
              </h1>
              {existingOrder ? (
                <PurchaseOrderStatusBadge
                  statusId={existingOrder.purchaseOrderStatusId}
                  fallback={existingOrder.statusDescription}
                />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {isCreate
                ? "Registra una orden de compra a proveedor y sus productos asociados."
                : "Revisa y actualiza la información operativa de la orden de compra."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
