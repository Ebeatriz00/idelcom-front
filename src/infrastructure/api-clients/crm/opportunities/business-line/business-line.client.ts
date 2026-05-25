import type {
  BusinessLineResponseDto,
  BusinessLineStatusDto,
  BusinessLineUpsertDto,
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

export async function fetchBusinessLineList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number 
): Promise<Paginated<BusinessLineResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<BusinessLineResponseDto>>
      | Paginated<BusinessLineResponseDto>
    >("/BusinessLine/BusinessLineList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<BusinessLineResponseDto>>(data);
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

export async function fetchBusinessLineSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/BusinessLine/BusinessLineSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchBusinessLineById(
  BusinessLineId: number
): Promise<BusinessLineResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<BusinessLineResponseDto> | BusinessLineResponseDto
  >("/BusinessLine/BusinessLineById", {
    params: { BusinessLineId: BusinessLineId },
  });

  return unwrap<BusinessLineResponseDto>(data);
}

type BusinessLineCreateDto = Omit<BusinessLineUpsertDto, "businessLineId">;
export async function createBusinessLine(
  dto: BusinessLineCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/BusinessLine/BusinessLineCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateBusinessLine(
  dto: BusinessLineUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/BusinessLine/BusinessLineUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateBusinessLineStatus(
  dto: BusinessLineStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/BusinessLine/BusinessLineStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
