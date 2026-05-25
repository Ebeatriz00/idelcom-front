export const qkSupportState = {
  all: ["supportState"] as const,
  lists: () => [...qkSupportState.all, "list"] as const,
  select: (page: number, pageSize: number, search?: string) =>
    [...qkSupportState.lists(), "select", page, pageSize, search] as const,
  details: () => [...qkSupportState.all, "detail"] as const,
  detail: (id: number) => [...qkSupportState.details(), id] as const,
};
