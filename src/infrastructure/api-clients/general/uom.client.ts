import http from "@/infrastructure/http/httpClient";

import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

// Importa los DTOs para UOM en lugar de Currency
import type {
  OptionItem,
  PagedSelect,
  Paginated,
  UomResponseDto,
  UomStatusDto,
  UomUpsertDto,
} from "@/application";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchUomList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<UomResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<UomResponseDto>> | Paginated<UomResponseDto>
    >("/Uom/UomList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<UomResponseDto>>(data);
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

export async function fetchUomSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Uom/UomSelect", {
    // Endpoint actualizado para UOM
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchUomById(
  uomId: number // Parámetro actualizado
): Promise<UomResponseDto> {
  const { data } = await http.get<ApiEnvelope<UomResponseDto> | UomResponseDto>(
    "/Uom/UomIdList",
    {
      // Endpoint actualizado para UOM
      params: { UomId: uomId }, // Parámetro de query actualizado
    }
  );

  return unwrap<UomResponseDto>(data);
}

// Se crea un DTO específico para la creación, omitiendo el ID
type UomCreateDto = Omit<UomUpsertDto, "uomId">;

export async function createUom(dto: UomCreateDto): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/Uom/UomCreate", // Endpoint actualizado para UOM
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateUom(dto: UomUpsertDto): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Uom/UomUpdate", // Endpoint actualizado para UOM
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateUomStatus(
  dto: UomStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Uom/UomStatus", // Endpoint actualizado para UOM
    { ...dto, businessId, usersBy }
  );
  return data;
}
