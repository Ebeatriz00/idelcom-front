export const qkWorkDayStatus = {
  all: ["operations", "workday-status"] as const,
  selects: () => [...qkWorkDayStatus.all, "select"] as const,
  select: (page: number, pageSize: number, search: string) =>
    [...qkWorkDayStatus.selects(), { page, pageSize, search }] as const,
  details: () => [...qkWorkDayStatus.all, "detail"] as const,
  detail: (id: number) => [...qkWorkDayStatus.details(), id] as const,
};
