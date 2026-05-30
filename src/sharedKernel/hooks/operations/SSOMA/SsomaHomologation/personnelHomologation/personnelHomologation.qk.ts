export const qkPersonnelHomologation = {
  all: ["ssomaHomologation"] as const,
  lists: () => [...qkPersonnelHomologation.all, "list"] as const,

  list: (page: number, pageSize: number, search?: string) =>
    [...qkPersonnelHomologation.lists(), { page, pageSize, search }] as const,

  details: () => [...qkPersonnelHomologation.all, "detail-by-id"] as const,
  detailById: (id: number) =>
    [...qkPersonnelHomologation.details(), id] as const,

  listByWorker: (
    operationsId: number | undefined,
    workerId: number,
    page: number,
    pageSize: number,
    search?: string,
  ) =>
    [
      ...qkPersonnelHomologation.lists(),
      "by-worker",
      operationsId,
      workerId,
      page,
      pageSize,
      search,
    ] as const,

  selects: () => [...qkPersonnelHomologation.all, "select"] as const,
  SelectOperationForHomologation: (
    page: number,
    pageSize: number,
    search?: string,
  ) =>
    [
      ...qkPersonnelHomologation.selects(),
      "operation-for-homologation",
      page,
      pageSize,
      search,
    ] as const,
};
