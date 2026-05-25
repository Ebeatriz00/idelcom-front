export const PURCHASE_ORDER_STATUS_ID = {
  DRAFT: 1,
  PENDING_APPROVAL: 2,
  APPROVED: 3,
  SENT_TO_SUPPLIER: 4,
  PARTIALLY_RECEIVED: 5,
  FULLY_RECEIVED: 6,
  PARTIALLY_INVOICED: 7,
  FULLY_INVOICED: 8,
  CLOSED: 9,
  CANCELLED: 10,
  REJECTED: 11,
} as const;

export type PurchaseOrderStatusId =
  (typeof PURCHASE_ORDER_STATUS_ID)[keyof typeof PURCHASE_ORDER_STATUS_ID];

export const PURCHASE_ORDER_STATUS_CONFIG: Record<
  PurchaseOrderStatusId,
  { code: string; label: string; className: string }
> = {
  [PURCHASE_ORDER_STATUS_ID.DRAFT]: {
    code: "DRAFT",
    label: "Borrador",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  [PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL]: {
    code: "PENDING_APPROVAL",
    label: "Pendiente de aprobación",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  [PURCHASE_ORDER_STATUS_ID.APPROVED]: {
    code: "APPROVED",
    label: "Aprobada",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  [PURCHASE_ORDER_STATUS_ID.SENT_TO_SUPPLIER]: {
    code: "SENT_TO_SUPPLIER",
    label: "Enviada al proveedor",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  [PURCHASE_ORDER_STATUS_ID.PARTIALLY_RECEIVED]: {
    code: "PARTIALLY_RECEIVED",
    label: "Parcialmente recibida",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  [PURCHASE_ORDER_STATUS_ID.FULLY_RECEIVED]: {
    code: "FULLY_RECEIVED",
    label: "Recibida total",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  [PURCHASE_ORDER_STATUS_ID.PARTIALLY_INVOICED]: {
    code: "PARTIALLY_INVOICED",
    label: "Facturada parcial",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  [PURCHASE_ORDER_STATUS_ID.FULLY_INVOICED]: {
    code: "FULLY_INVOICED",
    label: "Facturada total",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  [PURCHASE_ORDER_STATUS_ID.CLOSED]: {
    code: "CLOSED",
    label: "Cerrada",
    className: "border-zinc-200 bg-zinc-50 text-zinc-700",
  },
  [PURCHASE_ORDER_STATUS_ID.CANCELLED]: {
    code: "CANCELLED",
    label: "Anulada",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  [PURCHASE_ORDER_STATUS_ID.REJECTED]: {
    code: "REJECTED",
    label: "Rechazada",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export const PURCHASE_ORDER_EDITABLE_STATUS_IDS = [
  PURCHASE_ORDER_STATUS_ID.DRAFT,
] as const;

export const PURCHASE_ORDER_APPROVABLE_STATUS_IDS = [
  PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL,
] as const;

export const PURCHASE_ORDER_SENDABLE_STATUS_IDS = [
  PURCHASE_ORDER_STATUS_ID.DRAFT,
] as const;

export const PURCHASE_ORDER_CANCELABLE_STATUS_IDS = [
  PURCHASE_ORDER_STATUS_ID.DRAFT,
  PURCHASE_ORDER_STATUS_ID.PENDING_APPROVAL,
  PURCHASE_ORDER_STATUS_ID.APPROVED,
  PURCHASE_ORDER_STATUS_ID.SENT_TO_SUPPLIER,
] as const;

export function isPurchaseOrderStatusIn(
  statusId: number,
  allowed: readonly number[],
) {
  return allowed.includes(statusId);
}

export function isDraftPurchaseOrderStatus(
  statusId?: number | null,
  statusDescription?: string | null,
) {
  if (statusId === PURCHASE_ORDER_STATUS_ID.DRAFT) return true;

  const normalizedStatus = String(statusDescription ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalizedStatus === "DRAFT" || normalizedStatus === "BORRADOR";
}
