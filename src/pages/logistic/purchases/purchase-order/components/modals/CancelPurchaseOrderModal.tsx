import { Loader2, X, XCircle } from "lucide-react";
import { useState } from "react";

import type { PurchaseOrderResponseDto } from "@/application";
import { Modal } from "@/layouts";

interface Props {
  open: boolean;
  order: PurchaseOrderResponseDto | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelPurchaseOrderModal({ open, order, saving, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const hasError = touched && reason.trim().length === 0;

  function handleClose() {
    setReason("");
    setTouched(false);
    onClose();
  }

  function handleConfirm() {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
    setTouched(false);
  }

  if (!open || !order) return null;

  return (
    <Modal
      size="sm"
      onClose={handleClose}
      closeOnBackdrop={!saving}
      title={
        <div className="flex items-center gap-2">
          <XCircle className="size-5 text-red-600" />
          <span>Cancelar Orden de Compra</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-secondary/15 bg-white px-4 text-sm font-semibold text-secondary transition hover:bg-muted disabled:opacity-60"
          >
            <X className="size-4" />
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !reason.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
            Cancelar OC
          </button>
        </div>
      }
    >
      <div className="space-y-4 px-1">
        <p className="text-sm text-muted-foreground">
          Ingrese el motivo de cancelación para la orden{" "}
          <span className="font-semibold text-primary">
            #{order.purchaseOrderNumber ?? order.purchaseOrderId}
          </span>
          . Esta acción no se puede deshacer.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Motivo de cancelación <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Describa el motivo de la cancelación..."
            className={[
              "w-full resize-none rounded-xl border px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-muted-foreground focus:ring-2",
              hasError
                ? "border-red-300 bg-red-50/30 focus:ring-red-200"
                : "border-secondary/15 bg-white focus:border-primary/50 focus:ring-primary/15",
            ].join(" ")}
          />
          {hasError ? (
            <p className="text-xs font-medium text-red-600">
              El motivo de cancelación es requerido.
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
