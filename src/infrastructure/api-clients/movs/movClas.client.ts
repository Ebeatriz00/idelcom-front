import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure/http/httpClient";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchMovClasSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const businessId = getBusinessIdFromStorage();

  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/MovClas/MovClasSelect", {
    params: { business_id: businessId, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
