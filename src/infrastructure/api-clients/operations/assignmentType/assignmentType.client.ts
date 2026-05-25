import type {
  AssignmentTypeByIdDto,
  AssignmentTypeResponseDto,
  AssignmentTypeStatusDto,
  AssignmentTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";

import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };
function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchAssignmentTypesList(
  search: string,
  page: number,
  pageSize: number,
): Promise<Paginated<AssignmentTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<AssignmentTypeResponseDto>>
      | Paginated<AssignmentTypeResponseDto>
    >("/SsomaAsiggnmanetType/SsomaAssignmanetTypeList", {
      params: {
        businessId: bid,
        search,
        page,
        pageSize,
      },
    });
    return unwrap<Paginated<AssignmentTypeResponseDto>>(data);
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

export async function fetchAssignmentSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/SsomaAsiggnmanetType/AssignmentTypeSelect", {
    params: {
      businessId: bid,
      search,
      page,
      pageSize,
    },
  });
  return unwrap<PagedSelect<OptionItem>>(data);
}
export async function fetchAssignmentTypeById(
  ssomaAssignmentTypeId: number,
): Promise<AssignmentTypeByIdDto> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<AssignmentTypeByIdDto> | AssignmentTypeByIdDto
  >(
    `/SsomaAsiggnmanetType/SsomaAssignmanetTypeById?ssomaAssignmentTypeId=${ssomaAssignmentTypeId}`,
    {
      params: {
        businessId: bid,
      },
    },
  );
  return unwrap<AssignmentTypeByIdDto>(data);
}

type AssignmentTypeCreateDto = Omit<AssignmentTypeUpsertDto, "linkToken">;
export async function fetchCreateAssignmentType(
  dto: AssignmentTypeCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/SsomaAsiggnmanetType/AssignmentTypeCreate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchUpdateAssignmentType(dto: AssignmentTypeUpsertDto) {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/SsomaAsiggnmanetType/SsomaAssignmanetTypeUpdate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchUpdateAssignmentTypeStatus(
  dto: AssignmentTypeStatusDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/SsomaAsiggnmanetType/AssignmentTypeUpdateStatus",
    { ...dto, businessId, usersBy },
  );
  return data;
}
