export const qkSquad = {
  all: ["operations", "squad"] as const,
  lists: () => [...qkSquad.all, "list"] as const,
  list: (page: number, pageSize: number, workOrderId: number, search: string) =>
    [...qkSquad.lists(), { page, pageSize, workOrderId, search }] as const,
  details: () => [...qkSquad.all, "detail"] as const,
  detail: (id: number) => [...qkSquad.details(), id] as const,
};
