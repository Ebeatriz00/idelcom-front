import type { OptionItem, PagedSelect } from "@/application";
import { fetchActivityTypeSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkActivityType = {
  all: ["activityType"] as const,

  selects: () => [...qkActivityType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkActivityType.selects(), page, search ?? "", pageSize] as const,

  selectsOp: () =>
    [...qkActivityType.all, "select-option-activity-state"] as const,
  selectOp: () => [...qkActivityType.selects()] as const,
};

export function useActivityTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkActivityType.select(page, s, pageSize),
    queryFn: () => fetchActivityTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
