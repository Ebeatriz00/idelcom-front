export const qkAssignment = {
  all: ["operations", "personnel-assignment"] as const,
  lists: () => [...qkAssignment.all, "list"] as const,
  list: (page: number, pageSize: number, search: string) =>
    [...qkAssignment.lists(), { page, pageSize, search }] as const,
  details: () => [...qkAssignment.all, "detail"] as const,
  detail: (id: number) => [...qkAssignment.details(), id] as const,
};
