import type { OptionItem, PagedSelect } from "@/application";
import { fetchAuxiliaryTypeSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkAuxiliaryType = {
  all: ["auxiliary-type"] as const,

  selects: () => [...qkAuxiliaryType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAuxiliaryType.selects(), page, search ?? "", pageSize] as const,
};

export function useAuxiliaryTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAuxiliaryType.select(page, s, pageSize),
    queryFn: () => fetchAuxiliaryTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
