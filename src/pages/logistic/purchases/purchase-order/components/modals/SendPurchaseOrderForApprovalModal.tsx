import { Loader2, SendHorizontal, X } from "lucide-react";

import type { PurchaseOrderResponseDto } from "@/application";
import { Modal } from "@/layouts";

import {
  formatPurchaseOrderCurrencyValue,
  formatPurchaseOrderDate,
} from "../../utils/purchaseOrder.table.helpers";

interface Props {
  open: boolean;
  order: PurchaseOrderResponseDto | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SendPurchaseOrderForApprovalModal({
  open,
  order,
  saving,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !order) return null;

  return (
    <Modal
      size="sm"
      onClose={onClose}
      closeOnBackdrop={!saving}
      title={
        <div className="flex items-center gap-2">
          <SendHorizontal className="size-5 text-amber-600" />
          <span>Enviar a Aprobación</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-secondary/15 bg-white px-4 text-sm font-semibold text-secondary transition hover:bg-muted disabled:opacity-60"
          >
            <X className="size-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
            Enviar
          </button>
        </div>
      }
    >
      <div className="space-y-4 px-1">
        <p className="text-sm text-muted-foreground">
          Está a punto de enviar esta orden a aprobación. Un aprobador deberá
          revisarla antes de que pueda usarse.
        </p>

        <div className="space-y-2 rounded-xl border border-secondary/10 bg-muted p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nro. Orden</span>
            <span className="font-semibold text-primary">
              #{order.purchaseOrderNumber ?? order.purchaseOrderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Proveedor</span>
            <span className="font-medium text-secondary">
              {order.supplierName ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span className="text-secondary">
              {formatPurchaseOrderDate(order.purchaseOrderDate)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-secondary/10 pt-2">
            <span className="font-semibold text-secondary">Total</span>
            <span className="text-base font-bold text-primary">
              {formatPurchaseOrderCurrencyValue(
                order.total ?? 0,
                order.currencyId,
              )}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
