export const qkOperations = {
  all: ["operations", "base"] as const,
  lists: () => [...qkOperations.all, "list"] as const,
  list: (page: number, pageSize: number) =>
    [...qkOperations.lists(), { page, pageSize }] as const,
  details: () => [...qkOperations.all, "detail"] as const,
  detail: (id: number) => [...qkOperations.details(), id] as const,
};
