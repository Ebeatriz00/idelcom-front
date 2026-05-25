import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  PermissionsStatusDto,
  PermissionsUpsertDto,
} from "@/application/dtos/configurations/Permissions/Permissions.dto";
import type { PermissionsResponseDto } from "@/application/dtos/configurations/Permissions/PermissionsResponse.dto";
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

export async function fetchPermissionsList(
  page: number,
  pageSize: number
): Promise<Paginated<PermissionsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<PermissionsResponseDto>>
      | Paginated<PermissionsResponseDto>
    >("/Permissions/PermissionsList", {
      params: { business_id: bid, page, pageSize },
    });

    return unwrap<Paginated<PermissionsResponseDto>>(data);
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

export async function fetchPermissionsSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Permissions/PermissionsSelect", {
    params: { business_id: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPermissionsById(
  permissionsId: number
): Promise<PermissionsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<PermissionsResponseDto> | PermissionsResponseDto
  >("/Permissions/PermissionsIdList", {
    params: { permissionId: permissionsId },
  });

  return unwrap<PermissionsResponseDto>(data);
}

export async function createPermissions(
  dto: PermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: PermissionsUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/Permissions/PermissionsCreate",
    payload
  );

  return data;
}

export async function updatePermissions(
  dto: PermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Permissions/PermissionsUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updatePermissionsStatus(
  dto: PermissionsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  console.log(dto);
  const { data } = await http.patch<GlobalResponse>(
    "/Permissions/PermissionsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
