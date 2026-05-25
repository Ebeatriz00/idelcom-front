import type {
  OptionItem,
  PagedSelect,
  Paginated,
  StateOpportunityByIdDto,
  StateOpportunityResponseDto,
  StateOpportunityStatusDto,
  StateOpportunityUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchStateOpportunityList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<StateOpportunityResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<StateOpportunityResponseDto>>
      | Paginated<StateOpportunityResponseDto>
    >("/StateOpportunity/StateOpportunityList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<StateOpportunityResponseDto>>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        page,
        pageSize,
      };
    }
    throw err;
  }
}

export async function fetchStateOpportunitySelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/StateOpportunity/StateOpportunitySelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchStateOpportunityById(
  StateOpportunityId: number
): Promise<StateOpportunityByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<StateOpportunityByIdDto> | StateOpportunityByIdDto
  >("/StateOpportunity/StateOpportunityById", {
    params: { StateOpportunityId: StateOpportunityId },
  });

  return unwrap<StateOpportunityByIdDto>(data);
}

type StateOpportunityCreateDto = Omit<
  StateOpportunityUpsertDto,
  "stateOpportunityId"
>;
export async function createStateOpportunity(
  dto: StateOpportunityCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/StateOpportunity/StateOpportunityCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateStateOpportunity(
  dto: StateOpportunityUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/StateOpportunity/StateOpportunityUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateStateOpportunityStatus(
  dto: StateOpportunityStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/StateOpportunity/StateOpportunityStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
