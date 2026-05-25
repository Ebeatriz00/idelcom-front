export const qkRequirement = {
  all: ["requirement"] as const,

  lists: () => [...qkRequirement.all, "list"] as const,
  list: (scopeId: number, page: number, pageSize: number, search: string) =>
    [...qkRequirement.lists(), scopeId, page, pageSize, search ?? ""] as const,

  listItem: (page: number, pageSize: number, search: string) =>
    [...qkRequirement.lists(), page, pageSize, search ?? ""] as const,

  selects: () => [...qkRequirement.all, "select"] as const,
  select: (scopeId: number, page: number, pageSize: number, search: string) =>
    [
      ...qkRequirement.selects(),
      scopeId,
      page,
      pageSize,
      search ?? "",
    ] as const,

  specifications: (requirementId: number) =>
    [...qkRequirement.all, "specifications", requirementId] as const,
  
  byId: (id: number) => [...qkRequirement.all, "by-id", id] as const,
};
