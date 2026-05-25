import type { OptionItem, PagedSelect } from "@/application";
import { fetchStatePreSaleSelect } from "@/infrastructure/api-clients/stpresale/statePreSale.client";
import { useQuery } from "@tanstack/react-query";

export const qkStatePreSale = {
  all: ["statepresale"] as const,

  selects: () => [...qkStatePreSale.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkStatePreSale.selects(), page, search ?? "", pageSize] as const,
};

export function useStatePreSaleOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkStatePreSale.select(page, s, pageSize),
    queryFn: () => fetchStatePreSaleSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}