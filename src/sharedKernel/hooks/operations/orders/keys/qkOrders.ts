export const qkOrders = {
  all: ["Orders"] as const,
  lists: () => [...qkOrders.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    responsibleStaffId: number | null,
  ) =>
    [
      ...qkOrders.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      responsibleStaffId,
    ] as const,
};
