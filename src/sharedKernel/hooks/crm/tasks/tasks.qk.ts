export const qkTasks = {
  all: ["tasks"] as const,
  lists: () => [...qkTasks.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string) =>
    [...qkTasks.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkTasks.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTasks.selects(), page, search ?? "", pageSize] as const,

  byId: (id: string) => [...qkTasks.all, "by-id", id] as const,
};
