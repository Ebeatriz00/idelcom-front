import type {
  ConceptsResponseDto,
  ConceptsStatusDto,
  ConceptsUpsertDto,
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

export async function fetchConceptsList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<ConceptsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ConceptsResponseDto>>
      | Paginated<ConceptsResponseDto>
    >("/Concepts/ConceptsList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<ConceptsResponseDto>>(data);
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

export async function fetchConceptsById(
  conceptsId: number
): Promise<ConceptsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ConceptsResponseDto> | ConceptsResponseDto
  >("/Concepts/ConceptsById", {
    params: { conceptsId: conceptsId },
  });

  return unwrap<ConceptsResponseDto>(data);
}

type ConceptsCreateDto = Omit<ConceptsUpsertDto, "conceptsId">;
export async function createConcepts(
  dto: ConceptsCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Concepts/ConceptsCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateConcepts(
  dto: ConceptsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Concepts/ConceptsUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateConceptsStatus(
  dto: ConceptsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Concepts/ConceptsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
