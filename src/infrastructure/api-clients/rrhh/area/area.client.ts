import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  AreaStatusDto,
  AreaUpsertDto,
} from "@/application/dtos/rrhh/Area/Area.dto";
import type { AreaResponseDto } from "@/application/dtos/rrhh/Area/AreaResponse.dto";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchAreaList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<AreaResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<AreaResponseDto>> | Paginated<AreaResponseDto>
    >("/Area/AreaList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<AreaResponseDto>>(data);
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

export async function fetchAreaSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Area/AreaSelect", {
    params: { business_id: bid, search, page, pageSize },
  });
  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchAreaById(areaId: number): Promise<AreaResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<AreaResponseDto> | AreaResponseDto
  >("/Area/AreaIdList", {
    params: { areaId: areaId },
  });

  return unwrap<AreaResponseDto>(data);
}

type AreaCreateDto = Omit<AreaUpsertDto, "areaId">;
export async function createArea(dto: AreaCreateDto): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Area/AreaCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateArea(dto: AreaUpsertDto): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Area/AreaUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateAreaStatus(
  dto: AreaStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Area/AreaStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
