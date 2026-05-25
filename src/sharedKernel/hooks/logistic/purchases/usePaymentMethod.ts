import type { OptionItem, PagedSelect } from "@/application";
import { fetchPaymentMethodSelect } from "@/infrastructure/api-clients/logistic/purchases/paymentMethod.client";
import { useQuery } from "@tanstack/react-query";

export const qkPaymentMethod = {
  all: ["paymentmethod"] as const,


  selects: () => [...qkPaymentMethod.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPaymentMethod.selects(), page, search ?? "", pageSize] as const,
};

export function usePaymentMethodOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPaymentMethod.select(page, s, pageSize),
    queryFn: () => fetchPaymentMethodSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
