export const qkSsomaProcess = {
  all: ["operations", "ssomaProcess"] as const,
  lists: () => [...qkSsomaProcess.all, "list"] as const,
  list: (
    page: number,
    pageSize: number,
    operationsId?: number | null,
    search?: string,
  ) =>
    [...qkSsomaProcess.lists(), { page, pageSize, operationsId, search }] as const,
  details: () => [...qkSsomaProcess.all, "detail"] as const,
  detail: (id: number) => [...qkSsomaProcess.details(), id] as const,
};
