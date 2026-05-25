import type { OptionItem, PagedSelect } from "@/application";
import { fetchNegotiationStagesSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkNegotiationStages = {
  all: ["negotiations-stages"] as const,

  selects: () => [...qkNegotiationStages.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkNegotiationStages.selects(), page, search ?? "", pageSize] as const,
};

export function useNegotiationStagesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkNegotiationStages.select(page, s, pageSize),
    queryFn: () => fetchNegotiationStagesSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
