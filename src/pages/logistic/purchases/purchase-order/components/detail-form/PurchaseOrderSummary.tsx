import { Loader2, ReceiptText, Save } from "lucide-react";

import { formatCurrencyValue } from "../../utils/purchaseOrder.helpers";

type PurchaseOrderSummaryProps = {
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  total: number;
  currencyId: number;
  isView: boolean;
  isCreate: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  canSubmit: boolean;
  hasLines: boolean;
  onCancel: () => void;
};

export function PurchaseOrderSummary({
  subtotal,
  discountTotal,
  taxAmount,
  total,
  currencyId,
  isView,
  isCreate,
  isSubmitting,
  isSaving,
  canSubmit,
  hasLines,
  onCancel,
}: PurchaseOrderSummaryProps) {
  return (
    <aside className="xl:sticky xl:top-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md bg-slate-100 p-1.5 text-slate-600">
            <ReceiptText className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Resumen</h2>
            <p className="text-xs text-slate-500">Cálculo de la orden.</p>
          </div>
        </div>

        {!hasLines ? (
          <div className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Agrega productos para calcular el total.
          </div>
        ) : null}

        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">{formatCurrencyValue(subtotal, currencyId)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Descuento total</span>
            <span className="font-medium tabular-nums">{formatCurrencyValue(discountTotal, currencyId)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>IGV</span>
            <span className="font-medium tabular-nums">{formatCurrencyValue(taxAmount, currencyId)}</span>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-3">
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </span>
              <span className="text-2xl font-bold text-primary tabular-nums">
                {formatCurrencyValue(total, currencyId)}
              </span>
            </div>
          </div>
        </div>

        {!isView ? (
          <div className="mt-4 space-y-2">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || isSaving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting || isSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {isCreate ? "Crear Orden" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        ) : null}
      </section>
    </aside>
  );
}
