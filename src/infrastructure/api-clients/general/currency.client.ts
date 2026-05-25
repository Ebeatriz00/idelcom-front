import http from "@/infrastructure/http/httpClient";

import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  CurrencyResponseDto,
  CurrencyStatusDto,
  CurrencyUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchCurrencyList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<CurrencyResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<CurrencyResponseDto>>
      | Paginated<CurrencyResponseDto>
    >("/Currency/CurrencyList", {
      // Endpoint actualizado
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<CurrencyResponseDto>>(data);
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

export async function fetchCurrencySelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Currency/CurrencySelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchCurrencyById(
  currencyId: number
): Promise<CurrencyResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<CurrencyResponseDto> | CurrencyResponseDto
  >("/Currency/CurrencyIdList", {
    params: { CurrencyId: currencyId },
  });

  return unwrap<CurrencyResponseDto>(data);
}

type CurrencyCreateDto = Omit<CurrencyUpsertDto, "currencyId">;
export async function createCurrency(
  dto: CurrencyCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Currency/CurrencyCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateCurrency(
  dto: CurrencyUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Currency/CurrencyUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateCurrencyStatus(
  dto: CurrencyStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Currency/CurrencyStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
