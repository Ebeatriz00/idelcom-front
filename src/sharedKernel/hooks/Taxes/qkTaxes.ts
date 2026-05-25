export const qkTaxes = {
  all: ["taxes"] as const,
  lists: () => [...qkTaxes.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkTaxes.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkTaxes.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTaxes.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkTaxes.all, "by-id", id] as const,
};
