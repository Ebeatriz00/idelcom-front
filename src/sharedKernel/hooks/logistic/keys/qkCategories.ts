export const qkCategories = {
  all: ["categories"] as const,
  lists: () => [...qkCategories.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkCategories.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkCategories.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkCategories.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkCategories.all, "by-id", id] as const,
};
