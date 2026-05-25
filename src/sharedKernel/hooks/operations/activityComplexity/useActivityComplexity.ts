import type { OptionItem, PagedSelect } from "@/application";
import { fetchActivityComplexitySelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useActivityComplexityOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: ["operations", "activityComplexity", "select", page, s, pageSize],
    queryFn: () => fetchActivityComplexitySelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
