export const qkWarehousesMovement = {
  all: ["WarehousesMovement"] as const,
  lists: () => [...qkWarehousesMovement.all, "list"] as const,

  list: (
    pageIndex: number,
    pageSize: number,
    search?: string,
    movementTypeId?: number,
    movOperId?: number,
    warehouseId?: number,
    dateFrom?: string,
    dateTo?: string,
  ) =>
    [
      ...qkWarehousesMovement.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      movementTypeId ?? undefined,
      movOperId ?? undefined,
      warehouseId ?? undefined,
      dateFrom ?? "",
      dateTo ?? "",
    ] as const,

  byId: (id: number | string) =>
    [...qkWarehousesMovement.all, "by-id", String(id)] as const,

  availableStock: (
    warehouseId?: number,
    productsId?: number,
    search?: string,
  ) =>
    [
      ...qkWarehousesMovement.all,
      "available-stock",
      warehouseId ?? undefined,
      productsId ?? undefined,
      search ?? "",
    ] as const,
};
