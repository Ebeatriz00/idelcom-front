export const qkProductTypes = {
  all: ["productTypes"] as const,
  lists: () => [...qkProductTypes.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkProductTypes.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkProductTypes.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkProductTypes.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkProductTypes.all, "by-id", id] as const,
};
