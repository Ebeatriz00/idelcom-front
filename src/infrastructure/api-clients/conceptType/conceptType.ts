import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure/http/httpClient";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchConceptTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ConceptType/ConceptTypesSelect", {
    params: { business_id: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
