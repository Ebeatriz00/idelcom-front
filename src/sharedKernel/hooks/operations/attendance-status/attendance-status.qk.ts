export const qkAttendanceStatus = {
  all: ["operations", "attendance-status"] as const,
  selects: () => [...qkAttendanceStatus.all, "select"] as const,
  select: (page: number, pageSize: number, search: string) =>
    [...qkAttendanceStatus.selects(), { page, pageSize, search }] as const,
  details: () => [...qkAttendanceStatus.all, "detail"] as const,
  detail: (id: number) => [...qkAttendanceStatus.details(), id] as const,
};
