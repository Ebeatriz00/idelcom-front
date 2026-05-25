import type { OptionItem, PagedSelect } from "@/application";
import type { PriorityStateSelectDto } from "@/application/dtos/sttask/prioritystate/PriorityState.dto";
import http from "@/infrastructure/http/httpClient";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchPriorityStateSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const businessId = getBusinessIdFromStorage();

  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/PriorityState/PriorityStateSelect", {
    params: { businessId: businessId, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPrioritySelectSelectOp(): Promise<
  PriorityStateSelectDto[]
> {
  const bid = getBusinessIdFromStorage();

  if (!bid) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PriorityStateSelectDto[]> | PriorityStateSelectDto[]
  >("/PriorityState/PriorityStateSelectNo", {
    params: { businessId: bid },
  });

  return unwrap<PriorityStateSelectDto[]>(data);
}
