export const qkWarehouses = {
  all: ["warehouses"] as const,
  lists: () => [...qkWarehouses.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkWarehouses.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkWarehouses.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkWarehouses.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkWarehouses.all, "by-id", id] as const,
};
