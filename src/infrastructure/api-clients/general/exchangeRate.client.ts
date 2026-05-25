import http from "@/infrastructure/http/httpClient";

import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  ExchangeRateResponseDto,
  ExchangeRateStatusDto,
  ExchangeRateUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchExchangeRateList(
  page: number,
  pageSize: number,
  search: string,
  date?: string | null,
  usersBy?: number
): Promise<Paginated<ExchangeRateResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const params: any = {
    business_id: bid,
    search,
    page,
    pageSize,
    usersBy,
  };
  if (date) params.dateFxRate = date;

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ExchangeRateResponseDto>>
      | Paginated<ExchangeRateResponseDto>
    >("/ExchangeRate/ExchangeRateList", {
      params,
    });
    return unwrap<Paginated<ExchangeRateResponseDto>>(data);
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

export async function fetchExchangeRateSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ExchangeRate/ExchangeRateSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchExchangeRateById(
  exchangeRateId: number
): Promise<ExchangeRateResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ExchangeRateResponseDto> | ExchangeRateResponseDto
  >("/ExchangeRate/ExchangeRateIdList", {
    params: { exchangeRateId: exchangeRateId },
  });

  return unwrap<ExchangeRateResponseDto>(data);
}

// --- MUTATIONS (Creación, actualización y cambio de estado) ---

type ExchangeRateCreateDto = Omit<ExchangeRateUpsertDto, "exchangeRateId">;
export async function createExchangeRate(
  dto: ExchangeRateCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/ExchangeRate/ExchangeRateCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateExchangeRate(
  dto: ExchangeRateUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ExchangeRate/ExchangeRateUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateExchangeRateStatus(
  dto: ExchangeRateStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage()?.toString(); // Asegurar que sea string
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ExchangeRate/ExchangeRateStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
