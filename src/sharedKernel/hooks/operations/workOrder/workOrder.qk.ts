export const qkWorkOrder = {
  all: ["operations", "workOrder"] as const,
  lists: () => [...qkWorkOrder.all, "list"] as const,
  list: (page: number, pageSize: number, operationsId: number, search: string) =>
    [...qkWorkOrder.lists(), { page, pageSize, operationsId, search }] as const,
  details: () => [...qkWorkOrder.all, "detail"] as const,
  detail: (id: number) => [...qkWorkOrder.details(), id] as const,
};
