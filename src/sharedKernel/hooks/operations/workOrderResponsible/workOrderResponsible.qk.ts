export const qkWorkOrderResponsible = {
  all: ["operations", "workOrderResponsible"] as const,
  lists: () => [...qkWorkOrderResponsible.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkWorkOrderResponsible.lists(), { pageIndex, pageSize, search }] as const,
  details: () => [...qkWorkOrderResponsible.all, "detail"] as const,
  detail: (id: number) => [...qkWorkOrderResponsible.details(), id] as const,
};
