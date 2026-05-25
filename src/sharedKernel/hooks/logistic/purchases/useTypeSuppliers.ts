import type { OptionItem, PagedSelect } from "@/application";
import { fetchTypeSuppliersSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkTypeSuppliers = {
  all: ["type-suppliers"] as const,

  selects: () => [...qkTypeSuppliers.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTypeSuppliers.selects(), page, search ?? "", pageSize] as const,
};

export function useTypeSuppliersOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTypeSuppliers.select(page, s, pageSize),
    queryFn: () => fetchTypeSuppliersSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
