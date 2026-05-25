export const qkMedicalAptitude = {
  all: ["medical-aptitude"] as const,

  selects: () => [...qkMedicalAptitude.all, "select"] as const,
  select: (page: number, pageSize: number, search: string) =>
    [...qkMedicalAptitude.selects(), page, pageSize, search ?? ""] as const,
};
