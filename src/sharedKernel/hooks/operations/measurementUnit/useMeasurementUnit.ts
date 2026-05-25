import { useQuery } from "@tanstack/react-query";
import { fetchMeasurementUnitSelect } from "@/infrastructure";
import type { OptionItem, PagedSelect } from "@/application";

export function useMeasurementUnitOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: ["operations", "measurementUnit", "select", page, s, pageSize],
    queryFn: () => fetchMeasurementUnitSelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
