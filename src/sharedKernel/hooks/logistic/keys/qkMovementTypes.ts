export const qkMovementTypes = {
  all: ["movement-types"] as const,
  lists: () => [...qkMovementTypes.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
  ) =>
    [
      ...qkMovementTypes.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      usersKey,
    ] as const,

  selects: () => [...qkMovementTypes.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovementTypes.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkMovementTypes.all, "by-id", id] as const,
};
