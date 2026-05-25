import type { OptionItem, PagedSelect } from "@/application";
import {
  fetchPurchaseOrderDetailStatusSelect,
  fetchPurchaseOrderStatusSelect,
} from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  qkPurchaseOrderDetailStatus,
  qkPurchaseOrderStatus,
} from "../keys/qk.PurchaseOrderStatus";

export function usePurchaseOrderStatusOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPurchaseOrderStatus.select(page, s, pageSize),
    queryFn: () => fetchPurchaseOrderStatusSelect(page, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
export function usePurchaseOrderDetailStatusOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPurchaseOrderDetailStatus.select(page, s, pageSize),
    queryFn: () => fetchPurchaseOrderDetailStatusSelect(page, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
