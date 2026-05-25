export const qkSupervisor = {
  all: ["operations", "supervisor"] as const,
  lists: () => [...qkSupervisor.all, "list"] as const,
  list: (page: number, pageSize: number, search: string) =>
    [...qkSupervisor.lists(), { page, pageSize, search }] as const,
  details: () => [...qkSupervisor.all, "detail"] as const,
  detail: (id: number) => [...qkSupervisor.details(), id] as const,
};
