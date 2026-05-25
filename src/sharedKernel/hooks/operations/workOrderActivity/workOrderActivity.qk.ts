export const qkWorkOrderActivity = {
  all: ["operations", "workOrderActivity"] as const,
  lists: () => [...qkWorkOrderActivity.all, "list"] as const,
  list: (workOrderId: number, page: number, pageSize: number, search: string) =>
    [...qkWorkOrderActivity.lists(), { workOrderId, page, pageSize, search }] as const,
  selects: () => [...qkWorkOrderActivity.all, "select"] as const,
  select: (operationsId: number, page: number, pageSize: number, search: string) =>
    [...qkWorkOrderActivity.selects(), { operationsId, page, pageSize, search }] as const,
  details: () => [...qkWorkOrderActivity.all, "detail"] as const,
  detail: (id: number) => [...qkWorkOrderActivity.details(), id] as const,
};
