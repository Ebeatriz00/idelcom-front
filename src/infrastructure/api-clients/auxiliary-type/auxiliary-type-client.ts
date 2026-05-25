import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure/http/httpClient";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchAuxiliaryTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/AuxiliarType/AuxiliarTypeSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
