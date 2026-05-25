export const qkPurchaseOrderStatus = {
  all: ["logistic", "purchaseOrderStatus"] as const,
  lists: () => [...qkPurchaseOrderStatus.all, "list"] as const,
  selects: () => [...qkPurchaseOrderStatus.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPurchaseOrderStatus.selects(), page, search ?? "", pageSize] as const,
};

export const qkPurchaseOrderDetailStatus = {
  all: ["logistic", "purchaseOrderDetailStatus"] as const,
  lists: () => [...qkPurchaseOrderDetailStatus.all, "list"] as const,
  selects: () => [...qkPurchaseOrderDetailStatus.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [
      ...qkPurchaseOrderDetailStatus.selects(),
      page,
      search ?? "",
      pageSize,
    ] as const,
};
