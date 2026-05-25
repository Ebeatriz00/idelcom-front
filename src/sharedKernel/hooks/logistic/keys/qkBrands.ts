export const qkBrands = {
  all: ["brands"] as const,
  lists: () => [...qkBrands.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkBrands.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkBrands.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkBrands.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkBrands.all, "by-id", id] as const,
};
