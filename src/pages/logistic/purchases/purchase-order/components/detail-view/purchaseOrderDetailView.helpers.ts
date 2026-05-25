import type { PurchaseOrderDetailResponse, PurchaseOrderGetByIdResponse } from "@/application";

import { PURCHASE_ORDER_STATUS_ID } from "../../utils/purchaseOrder.constants";
import {
  formatCurrencyValue,
  formatPurchaseOrderDateValue,
} from "../../utils/purchaseOrder.helpers";

export const notRegistered = "No registrado";

export function detailDate(value?: Date | string | number | null) {
  if (!value) return notRegistered;
  const formatted = formatPurchaseOrderDateValue(value);
  return formatted === "—" ? notRegistered : formatted;
}

export function detailMoney(amount?: number | null, currencyId = 1) {
  return formatCurrencyValue(Number(amount ?? 0), currencyId);
}

export function detailValue(value?: string | number | null) {
  if (value === 0) return "0";
  return value ? String(value) : notRegistered;
}

export function getReceivedSummary(order: PurchaseOrderGetByIdResponse) {
  const quantity = order.details.reduce((acc, item) => acc + Number(item.quantity ?? 0), 0);
  const received = order.details.reduce(
    (acc, item) => acc + Number(item.receivedQuantity ?? 0),
    0,
  );
  const pending = order.details.reduce(
    (acc, item) => acc + Number(item.pendingQuantity ?? 0),
    0,
  );
  const pendingAmount = order.details.reduce((acc, item) => {
    const qty = Number(item.quantity ?? 0);
    if (qty <= 0) return acc;
    return acc + Number(item.total ?? 0) * (Number(item.pendingQuantity ?? 0) / qty);
  }, 0);

  return {
    quantity,
    received,
    pending,
    pendingAmount,
    progress: quantity > 0 ? Math.min(100, Math.round((received / quantity) * 100)) : 0,
  };
}

export function getLineReceptionStatus(detail: PurchaseOrderDetailResponse) {
  const quantity = Number(detail.quantity ?? 0);
  const received = Number(detail.receivedQuantity ?? 0);

  if (quantity > 0 && received >= quantity) {
    return {
      label: "Recibido",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      progress: 100,
    };
  }

  if (received > 0) {
    return {
      label: "Parcial",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      progress: quantity > 0 ? Math.round((received / quantity) * 100) : 0,
    };
  }

  return {
    label: "Sin recibir",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    progress: 0,
  };
}

export function getPrimaryDetailAction(statusId: number) {
  if (statusId === PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL) return "approve";
  if (
    statusId === PURCHASE_ORDER_STATUS_ID.APPROVED ||
    statusId === PURCHASE_ORDER_STATUS_ID.SENT_TO_SUPPLIER ||
    statusId === PURCHASE_ORDER_STATUS_ID.PARTIALLY_RECEIVED
  ) {
    return "receive";
  }
  if (statusId === PURCHASE_ORDER_STATUS_ID.FULLY_RECEIVED) return "view-receipt";
  return null;
}


