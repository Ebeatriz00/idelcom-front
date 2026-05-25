export function createSelectKeys(base: string) {
  return {
    all: [base, "select"] as const,
    page: (search: string, page: number, pageSize: number) =>
      [base, "select", search ?? "", page, pageSize] as const,
  };
}