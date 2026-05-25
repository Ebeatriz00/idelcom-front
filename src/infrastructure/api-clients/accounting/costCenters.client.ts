import type {
  CostCentersResponseDto,
  CostCentersStatusDto,
  CostCentersUpsertDto,
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

export async function fetchCostCentersList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<CostCentersResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<CostCentersResponseDto>>
      | Paginated<CostCentersResponseDto>
    >("/CostCenters/CostCentersList", {
      params: { business_id: bid, search, page, pageSize, usersBy},
    });
    return unwrap<Paginated<CostCentersResponseDto>>(data);
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

export async function fetchCostCentersSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/CostCenters/CostCentersSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchCostCentersById(
  costCentersId: number
): Promise<CostCentersResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<CostCentersResponseDto> | CostCentersResponseDto
  >("/CostCenters/CostCentersById", {
    params: { costCentersId },
  });

  return unwrap<CostCentersResponseDto>(data);
}

type CostCentersCreateDto = Omit<CostCentersUpsertDto, "costCentersId">;
export async function createCostCenters(
  dto: CostCentersCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/CostCenters/CostCentersCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateCostCenters(
  dto: CostCentersUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/CostCenters/CostCentersUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateCostCentersStatus(
  dto: CostCentersStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/CostCenters/CostCentersStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
