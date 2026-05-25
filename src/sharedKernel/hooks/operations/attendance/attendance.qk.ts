export const qkAttendance = {
  all: ["attendance"] as const,
  matrix: (params: any) => [...qkAttendance.all, "matrix", params] as const,
};
