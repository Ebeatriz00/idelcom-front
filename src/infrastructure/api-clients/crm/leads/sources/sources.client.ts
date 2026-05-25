import type {
  LeadsSourcesResponseDto,
  LeadsSourcesStatusDto,
  LeadsSourcesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchLeadsSourcesList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<LeadsSourcesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<LeadsSourcesResponseDto>>
      | Paginated<LeadsSourcesResponseDto>
    >("/LeadsSources/LeadsSourcesList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<LeadsSourcesResponseDto>>(data);
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

export async function fetchLeadsSourcesSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/LeadsSources/LeadsSourcesSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchLeadsSourcesById(
  LeadsSourcesId: number
): Promise<LeadsSourcesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<LeadsSourcesResponseDto> | LeadsSourcesResponseDto
  >("/LeadsSources/LeadsSourcesIdList", {
    params: { leadsSourcesId: LeadsSourcesId },
  });

  return unwrap<LeadsSourcesResponseDto>(data);
}

type LeadsSourcesCreateDto = Omit<LeadsSourcesUpsertDto, "leadsSourcesId">;
export async function createLeadsSources(
  dto: LeadsSourcesCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/LeadsSources/LeadsSourcesCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateLeadsSources(
  dto: LeadsSourcesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/LeadsSources/LeadsSourcesUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateLeadsSourcesStatus(
  dto: LeadsSourcesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/LeadsSources/LeadsSourcesStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
