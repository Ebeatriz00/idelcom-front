import type {
  BoxesResponseDto,
  BoxesStatusDto,
  BoxesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
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

export async function fetchBoxesList(
  page: number,
  pageSize: number,
  search: string, 
  usersBy?: number
): Promise<Paginated<BoxesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<BoxesResponseDto>> | Paginated<BoxesResponseDto>
    >("/Boxes/BoxesList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<BoxesResponseDto>>(data);
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

export async function fetchBoxesSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Boxes/BoxesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchBoxesById(
  boxesId: number
): Promise<BoxesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<BoxesResponseDto> | BoxesResponseDto
  >("/Boxes/BoxesById", {
    params: { boxesId: boxesId },
  });

  return unwrap<BoxesResponseDto>(data);
}

type BoxesCreateDto = Omit<BoxesUpsertDto, "boxesId">;
export async function createBoxes(
  dto: BoxesCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Boxes/BoxesCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateBoxes(
  dto: BoxesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Boxes/BoxesUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateBoxesStatus(
  dto: BoxesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Boxes/BoxesStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
