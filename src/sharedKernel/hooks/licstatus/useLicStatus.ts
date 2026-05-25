import type { OptionItem, PagedSelect } from "@/application";
import { fetchLicStatusSelect } from "@/infrastructure/api-clients/licstatus/licStatus.client";
import { useQuery } from "@tanstack/react-query";

export const qkLicStatus = {
  all: ["licstatus"] as const,

  selects: () => [...qkLicStatus.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkLicStatus.selects(), page, search ?? "", pageSize] as const,
};

export function useLicStatusOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLicStatus.select(page, s, pageSize),
    queryFn: () => fetchLicStatusSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}