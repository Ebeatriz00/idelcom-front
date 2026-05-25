export const qkAssignmentType = {
  all: ["assignment-type"] as const,
  lists: () => [...qkAssignmentType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkAssignmentType.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkAssignmentType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAssignmentType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkAssignmentType.all, "by-id", id] as const,
};
