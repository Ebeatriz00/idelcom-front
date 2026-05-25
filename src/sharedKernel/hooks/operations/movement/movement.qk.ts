export const qkMovement = {
  all: ["operations", "personnel-movement"] as const,
  lists: () => [...qkMovement.all, "list"] as const,
  list: (page: number, pageSize: number, search: string) =>
    [...qkMovement.lists(), { page, pageSize, search }] as const,
};
