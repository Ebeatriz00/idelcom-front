import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchMedicalAptitudeSelect(
  page: number,
  pageSize: number,
  search?: string,
) {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/MedicalAptitude/MedicalAptitudeSelect", {
    params: { businessId: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
