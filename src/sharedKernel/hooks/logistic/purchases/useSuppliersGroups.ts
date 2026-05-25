import type { OptionItem, PagedSelect } from "@/application";
import { fetchSuppliersGroupsSelect } from "@/infrastructure/api-clients/logistic/purchases/suppliersGroups.client";
import { useQuery } from "@tanstack/react-query";

export const qkSuppliersGroups = {
  all: ["suppliers-groups"] as const,


  selects: () => [...qkSuppliersGroups.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkSuppliersGroups.selects(), page, search ?? "", pageSize] as const,
};

export function useSuppliersGroupsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkSuppliersGroups.select(page, s, pageSize),
    queryFn: () => fetchSuppliersGroupsSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
