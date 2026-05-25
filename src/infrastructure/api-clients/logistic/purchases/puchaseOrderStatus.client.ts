import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchPurchaseOrderStatusSelect(
  page: number,
  pageSize: number,
  search: string,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/PurchaseOrderStatus/PurchaseOrderStatusSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPurchaseOrderDetailStatusSelect(
  page: number,
  pageSize: number,
  search: string,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/PurchaseOrderDetailStatus/PurchaseOrderDetailStatusSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
