export const qkProducts = {
  all: ["Products-crm"] as const,
  lists: () => [...qkProducts.all, "list"] as const,

  list: (
    pageIndex: number,
    pageSize: number,
    search?: string,
    categoriesId?: number,
    productTypeId?: number,
    brandsId?: number,
  ) =>
    [
      ...qkProducts.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      categoriesId ?? undefined,
      productTypeId ?? undefined,
      brandsId ?? undefined,
    ] as const,

  selects: () => [...qkProducts.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkProducts.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number | string) =>
    [...qkProducts.all, "by-id", String(id)] as const,
};
