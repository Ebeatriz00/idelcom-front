export const qkOperationsStatus = {
  all: ["operations", "operations-status"] as const,
  selects: () => [...qkOperationsStatus.all, "select"] as const,
  select: (page: number, pageSize: number, search: string) =>
    [...qkOperationsStatus.selects(), { page, pageSize, search }] as const,
};
