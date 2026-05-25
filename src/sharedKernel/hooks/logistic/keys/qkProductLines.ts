export const qkProductLines = {
  all: ["product-lines"] as const,
  lists: () => [...qkProductLines.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkProductLines.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkProductLines.all, "select"] as const,
  select: (
    categoriesId: number | null | undefined,
    page: number,
    search: string,
    pageSize: number,
  ) =>
    [
      ...qkProductLines.selects(),
      categoriesId,
      page,
      search ?? "",
      pageSize,
    ] as const,

  byId: (id: number) => [...qkProductLines.all, "by-id", id] as const,
};
