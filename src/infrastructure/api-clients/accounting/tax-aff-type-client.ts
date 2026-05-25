import type {
  OptionItem,
  PagedSelect,
  Paginated,
  TaxAffTypeResponseDto,
  TaxAffTypeStatusDto,
  TaxAffTypeUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchTaxAffTypeList(
  page: number,
  pageSize: number,
  search: string, 
  usersBy?: number
): Promise<Paginated<TaxAffTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<TaxAffTypeResponseDto>>
      | Paginated<TaxAffTypeResponseDto>
    >("/TaxAffType/TaxAffTypeList", {
      // Endpoint actualizado
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<TaxAffTypeResponseDto>>(data);
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

export async function fetchTaxAffTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/TaxAffType/TaxAffTypeSelect", {
    // Endpoint actualizado
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchTaxAffTypeById(
  TaxAffTypeId: number
): Promise<TaxAffTypeResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<TaxAffTypeResponseDto> | TaxAffTypeResponseDto
  >("/TaxAffType/TaxAffTypeById", {
    // Endpoint actualizado
    params: { TaxAffTypeId: TaxAffTypeId }, // Parámetro actualizado
  });

  return unwrap<TaxAffTypeResponseDto>(data);
}

type TaxAffTypeCreateDto = Omit<TaxAffTypeUpsertDto, "TaxAffTypeId">;
export async function createTaxAffType(
  dto: TaxAffTypeCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/TaxAffType/TaxAffTypeCreate", // Endpoint actualizado
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateTaxAffType(
  dto: TaxAffTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/TaxAffType/TaxAffTypeUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateTaxAffTypeStatus(
  dto: TaxAffTypeStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/TaxAffType/TaxAffTypeStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
