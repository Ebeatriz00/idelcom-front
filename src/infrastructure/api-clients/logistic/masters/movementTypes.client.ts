import type {
  MovementTypesResponseDto,
  MovementTypesStatusDto,
  MovementTypesUpsertDto,
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

export async function fetchMovementTypesList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<MovementTypesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<MovementTypesResponseDto>>
      | Paginated<MovementTypesResponseDto>
    >("/MovementTypes/MovementTypesList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<MovementTypesResponseDto>>(data);
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

export async function fetchMovementTypesSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/MovementTypes/MovementTypesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchMovementTypesById(
  movementTypesId: number
): Promise<MovementTypesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<MovementTypesResponseDto> | MovementTypesResponseDto
  >("/MovementTypes/MovementTypesById", {
    params: { movementTypesId: movementTypesId },
  });

  return unwrap<MovementTypesResponseDto>(data);
}

type MovementTypesCreateDto = Omit<MovementTypesUpsertDto, "movementTypesId">;
export async function createMovementTypes(
  dto: MovementTypesCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/MovementTypes/MovementTypesCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateMovementTypes(
  dto: MovementTypesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/MovementTypes/MovementTypesUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateMovementTypesStatus(
  dto: MovementTypesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/MovementTypes/MovementTypesStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
