import type { OptionItem, PagedSelect } from "@/application";
import { fetchReasonRejectionSelect } from "@/infrastructure/api-clients/reason-rejection/reason-rejection.client";
import { useQuery } from "@tanstack/react-query";

export const qkReasonRejection = {
  all: ["reason-rejection"] as const,

  selects: () => [...qkReasonRejection.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkReasonRejection.selects(), page, search ?? "", pageSize] as const,
};

export function useReasonRejectionOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkReasonRejection.select(page, s, pageSize),
    queryFn: () => fetchReasonRejectionSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
