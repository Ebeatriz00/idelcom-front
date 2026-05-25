import { cn } from "@/sharedKernel/lib/cn";
import { PURCHASE_ORDER_STATUS_CONFIG } from "../../utils/purchaseOrder.constants";

export function getPurchaseOrderStatusLabel(statusId: number, fallback?: string | null) {
  return PURCHASE_ORDER_STATUS_CONFIG[statusId as keyof typeof PURCHASE_ORDER_STATUS_CONFIG]?.label ?? fallback ?? "Desconocido";
}

export function PurchaseOrderStatusBadge({
  statusId,
  fallback,
}: {
  statusId: number;
  fallback?: string | null;
}) {
  const config = PURCHASE_ORDER_STATUS_CONFIG[
    statusId as keyof typeof PURCHASE_ORDER_STATUS_CONFIG
  ] ?? {

    label: fallback ?? "Desconocido",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
