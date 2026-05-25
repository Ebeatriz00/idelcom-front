import type { PurchaseOrderListFilterDto } from "@/application";

export const qkPurchaseOrder = {
  all: ["logistic", "purchaseOrder"] as const,
  lists: () => [...qkPurchaseOrder.all, "list"] as const,
  list: (filter: PurchaseOrderListFilterDto) =>
    [...qkPurchaseOrder.lists(), filter] as const,
  details: () => [...qkPurchaseOrder.all, "detail"] as const,
  detail: (id: number) => [...qkPurchaseOrder.details(), id] as const,
};
