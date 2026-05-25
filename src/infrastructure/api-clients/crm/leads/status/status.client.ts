import type {
  LeadsStatusResponseDto,
  LeadsStatusStatusDto,
  LeadsStatusUpsertDto,
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

export async function fetchLeadsStatusList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: Number
): Promise<Paginated<LeadsStatusResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<LeadsStatusResponseDto>>
      | Paginated<LeadsStatusResponseDto>
    >("/LeadsStatus/LeadsStatusList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<LeadsStatusResponseDto>>(data);
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

export async function fetchLeadsStatusSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/LeadsStatus/LeadsStatusSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchLeadsStatusById(
  LeadsStatusId: number
): Promise<LeadsStatusResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<LeadsStatusResponseDto> | LeadsStatusResponseDto
  >("/LeadsStatus/LeadsStatusIdList", {
    params: { leadsStatusId: LeadsStatusId },
  });

  return unwrap<LeadsStatusResponseDto>(data);
}

type LeadsStatusCreateDto = Omit<LeadsStatusUpsertDto, "leadsStatusId">;
export async function createLeadsStatus(
  dto: LeadsStatusCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/LeadsStatus/LeadsStatusCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateLeadsStatus(
  dto: LeadsStatusUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/LeadsStatus/LeadsStatusUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateLeadsStatusStatus(
  dto: LeadsStatusStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/LeadsStatus/LeadsStatusStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
