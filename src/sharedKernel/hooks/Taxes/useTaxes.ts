import type { OptionItem, PagedSelect } from "@/application";
import { fetchTaxesSelect } from "@/infrastructure/";
import { useQuery } from "@tanstack/react-query";
import { qkTaxes } from "./qkTaxes";

export function useTaxesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTaxes.select(page, s, pageSize),
    queryFn: () => fetchTaxesSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
