import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProcessTypeResponseDto,
  ProcessTypeStatusDto,
  ProcessTypeUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchProcessTypeList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<ProcessTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ProcessTypeResponseDto>>
      | Paginated<ProcessTypeResponseDto>
    >("/ProcessType/ProcessTypeList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<ProcessTypeResponseDto>>(data);
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

export async function fetchProcessTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ProcessType/ProcessTypeSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchProcessTypeById(
  ProcessTypeId: number
): Promise<ProcessTypeResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ProcessTypeResponseDto> | ProcessTypeResponseDto
  >("/ProcessType/ProcessTypeById", {
    params: { ProcessTypeId: ProcessTypeId },
  });

  return unwrap<ProcessTypeResponseDto>(data);
}

type ProcessTypeCreateDto = Omit<ProcessTypeUpsertDto, "processTypeId">;
export async function createProcessType(
  dto: ProcessTypeCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/ProcessType/ProcessTypeCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateProcessType(
  dto: ProcessTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ProcessType/ProcessTypeUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateProcessTypeStatus(
  dto: ProcessTypeStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ProcessType/ProcessTypeStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
