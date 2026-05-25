import type { OptionItem, PagedSelect } from "@/application";
import { fetchPaymentConditionSelect } from "@/infrastructure/api-clients/accounting/pmCondition.client";
import { useQuery } from "@tanstack/react-query";

export const qkPaymentConditionType = {
  all: ["payment-condition"] as const,
  lists: () => [...qkPaymentConditionType.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
  ) =>
    [
      ...qkPaymentConditionType.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      usersKey,
    ] as const,

  selects: () => [...qkPaymentConditionType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [
      ...qkPaymentConditionType.selects(),
      page,
      search ?? "",
      pageSize,
    ] as const,

  byId: (id: number) => [...qkPaymentConditionType.all, "by-id", id] as const,
};

export function usePaymentConditionOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPaymentConditionType.select(page, s, pageSize),
    queryFn: () => fetchPaymentConditionSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
