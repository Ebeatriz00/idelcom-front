import type { PurchaseOrderResponseDto } from "@/application";
import { CheckCircle2, Eye, Pencil, Printer, SendHorizontal, XCircle } from "lucide-react";
import {
  isDraftPurchaseOrderStatus,
  isPurchaseOrderStatusIn,
  PURCHASE_ORDER_APPROVABLE_STATUS_IDS,
  PURCHASE_ORDER_CANCELABLE_STATUS_IDS,
  PURCHASE_ORDER_EDITABLE_STATUS_IDS,
} from "../../utils/purchaseOrder.constants";

type Props = {
  order: PurchaseOrderResponseDto;
  onView: (row: PurchaseOrderResponseDto) => void;
  onEdit: (row: PurchaseOrderResponseDto) => void;
  onSendForApproval: (row: PurchaseOrderResponseDto) => void;
  onApprove: (row: PurchaseOrderResponseDto) => void;
  onPrint: (row: PurchaseOrderResponseDto) => void;
  onCancel: (row: PurchaseOrderResponseDto) => void;
};

function actionClass(
  intent: "view" | "edit" | "send" | "approve" | "print" | "cancel",
) {
  const intents = {
    view: "border-sky-100 bg-sky-50 text-sky-700 hover:border-sky-200 hover:bg-sky-100",
    edit: "border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-200 hover:bg-orange-100",
    send: "border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200 hover:bg-amber-100",
    approve:
      "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100",
    print:
      "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
    cancel: "border-rose-100 bg-rose-50 text-rose-700 hover:border-rose-200 hover:bg-rose-100",
  };

  return [
    "inline-flex size-8 items-center justify-center rounded-md border transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20",
    intents[intent],
  ].join(" ");
}

export function PurchaseOrderActionsMenu({
  order,
  onView,
  onEdit,
  onSendForApproval,
  onApprove,
  onPrint,
  onCancel,
}: Props) {
  const canEdit = isPurchaseOrderStatusIn(
    order.purchaseOrderStatusId,
    PURCHASE_ORDER_EDITABLE_STATUS_IDS,
  );
  const canApprove = isPurchaseOrderStatusIn(
    order.purchaseOrderStatusId,
    PURCHASE_ORDER_APPROVABLE_STATUS_IDS,
  );
  const canSendForApproval = isDraftPurchaseOrderStatus(
    order.purchaseOrderStatusId,
    order.statusDescription,
  );
  const canCancel = isPurchaseOrderStatusIn(
    order.purchaseOrderStatusId,
    PURCHASE_ORDER_CANCELABLE_STATUS_IDS,
  );

  return (
    <div className="ml-auto grid w-[140px] grid-cols-4 justify-items-end gap-1">
      <button
        type="button"
        onClick={() => onView(order)}
        className={actionClass("view")}
        title="Ver detalle"
        aria-label="Ver detalle"
      >
        <Eye className="size-4" aria-hidden="true" />
      </button>

      {canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(order)}
          className={actionClass("edit")}
          title="Editar"
          aria-label="Editar"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {canSendForApproval ? (
        <button
          type="button"
          onClick={() => onSendForApproval(order)}
          className={actionClass("send")}
          title="Enviar a aprobación"
          aria-label="Enviar a aprobación"
        >
          <SendHorizontal className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {canApprove ? (
        <button
          type="button"
          onClick={() => onApprove(order)}
          className={actionClass("approve")}
          title="Aprobar"
          aria-label="Aprobar"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onPrint(order)}
        className={actionClass("print")}
        title="Imprimir"
        aria-label="Imprimir"
      >
        <Printer className="size-4" aria-hidden="true" />
      </button>

      {canCancel ? (
        <button
          type="button"
          onClick={() => onCancel(order)}
          className={actionClass("cancel")}
          title="Anular"
          aria-label="Anular"
        >
          <XCircle className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
