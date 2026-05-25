export const qkSuppliers = {
  all: ["suppliers"] as const,
  lists: () => [...qkSuppliers.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkSuppliers.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkSuppliers.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkSuppliers.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkSuppliers.all, "by-id", id] as const,
};
