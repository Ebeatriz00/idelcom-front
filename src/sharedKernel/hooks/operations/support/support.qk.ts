export const qkSupport = {
  all: ["support"] as const,
  lists: () => [...qkSupport.all, "list"] as const,
  list: (page: number, pageSize: number, search: string) =>
    [...qkSupport.lists(), { page, pageSize, search }] as const,
  details: () => [...qkSupport.all, "detail"] as const,
  detail: (id: number) => [...qkSupport.details(), id] as const,
};
