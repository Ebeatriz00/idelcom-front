import type {
  ConceptGroupsResponseDto,
  ConceptGroupsStatusDto,
  ConceptGroupsUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchConceptGroupsList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<ConceptGroupsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ConceptGroupsResponseDto>>
      | Paginated<ConceptGroupsResponseDto>
    >("/ConceptGroups/ConceptGroupsList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<ConceptGroupsResponseDto>>(data);
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

export async function fetchConceptGroupsSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ConceptGroups/ConceptGroupsSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchConceptGroupsById(
  conceptGroupsId: number
): Promise<ConceptGroupsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ConceptGroupsResponseDto> | ConceptGroupsResponseDto
  >("/ConceptGroups/ConceptGroupsIdList", {
    params: { conceptGroupsId: conceptGroupsId },
  });

  return unwrap<ConceptGroupsResponseDto>(data);
}

type ConceptGroupsCreateDto = Omit<ConceptGroupsUpsertDto, "conceptGroupsId">;
export async function createConceptGroups(
  dto: ConceptGroupsCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/ConceptGroups/ConceptGroupsCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateConceptGroups(
  dto: ConceptGroupsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ConceptGroups/ConceptGroupsUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateConceptGroupsStatus(
  dto: ConceptGroupsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ConceptGroups/ConceptGroupsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
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
  >("/ConceptType/ConceptTypeSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
