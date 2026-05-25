import type {
  OptionItem,
  PagedSelect,
  Paginated,
  SectorResponseDto,
  SectorStatusDto,
  SectorUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchSectorList(
  page: number,
  pageSize: number,
  search: string
): Promise<Paginated<SectorResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<SectorResponseDto>> | Paginated<SectorResponseDto>
    >("/Sector/SectorList", {
      params: { businessId: bid, search, page, pageSize },
    });
    return unwrap<Paginated<SectorResponseDto>>(data);
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

export async function fetchSectorSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Sector/SectorSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchSectorById(
  SectorId: number
): Promise<SectorResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<SectorResponseDto> | SectorResponseDto
  >("/Sector/SectorIdList", {
    params: { SectorId: SectorId },
  });

  return unwrap<SectorResponseDto>(data);
}

type SectorCreateDto = Omit<SectorUpsertDto, "SectorId">;
export async function createSector(
  dto: SectorCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Sector/SectorCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateSector(
  dto: SectorUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Sector/SectorUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateSectorStatus(
  dto: SectorStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Sector/SectorStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
