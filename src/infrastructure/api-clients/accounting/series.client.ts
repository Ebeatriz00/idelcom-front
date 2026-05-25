import type {
  OptionItem,
  PagedSelect,
  Paginated,
  SeriesResponseDto,
  SeriesStatusDto,
  SeriesUpsertDto,
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

export async function fetchSeriesList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<SeriesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<SeriesResponseDto>> | Paginated<SeriesResponseDto>
    >("/Series/SeriesList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<SeriesResponseDto>>(data);
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

export async function fetchSeriesSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Series/SeriesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchSeriesById(
  seriesId: number
): Promise<SeriesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<SeriesResponseDto> | SeriesResponseDto
  >("/Series/SeriesIdList", {
    params: { SeriesId: seriesId },
  });

  return unwrap<SeriesResponseDto>(data);
}

// Crea una nueva serie
type SeriesCreateDto = Omit<SeriesUpsertDto, "seriesId">;
export async function createSeries(
  dto: SeriesCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Series/SeriesCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateSeries(
  dto: SeriesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Series/SeriesUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateSeriesStatus(
  dto: SeriesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Series/SeriesStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
