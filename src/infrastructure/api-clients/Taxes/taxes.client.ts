import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchTaxesSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Taxes/TaxesSelect", {
    params: { search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
