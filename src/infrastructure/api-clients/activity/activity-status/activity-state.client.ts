import type {
  ActivityStateSelectDto,
  OptionItem,
  PagedSelect,
} from "@/application";
import http from "@/infrastructure";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchActivityStateSearchSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (!bid) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ActivityState/ActivityStateSelect", {
    params: { businessId: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchActivityStateSelectSelectOp(): Promise<
  ActivityStateSelectDto[]
> {
  const bid = getBusinessIdFromStorage();

  if (!bid) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<ActivityStateSelectDto[]> | ActivityStateSelectDto[]
  >("/ActivityState/ActivityStateSelectNo", {
    params: { businessId: bid },
  });

  return unwrap<ActivityStateSelectDto[]>(data);
}
