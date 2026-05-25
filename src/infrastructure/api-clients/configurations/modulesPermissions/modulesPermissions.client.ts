import type {
  ModulesPermissionsResponseByIdDto,
  ModulesPermissionsResponseDto,
  ModulesPermissionsUpsertDto,
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
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchModulesPermissionsList(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<ModulesPermissionsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ModulesPermissionsResponseDto>>
      | Paginated<ModulesPermissionsResponseDto>
    >("/ModulesPermissions/ModulesPermissionsList", {
      params: { business_id: bid, search, page, pageSize },
    });

    return unwrap<Paginated<ModulesPermissionsResponseDto>>(data);
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

export async function fetchModulesPermissionsById(
  modulesPermissionsId: number
): Promise<ModulesPermissionsResponseByIdDto> {
  const { data } = await http.get<
    | ApiEnvelope<ModulesPermissionsResponseByIdDto>
    | ModulesPermissionsResponseByIdDto
  >("/ModulesPermissions/ModulesPermissionsById", {
    params: { modulesPermissionsId: modulesPermissionsId },
  });

  return unwrap<ModulesPermissionsResponseByIdDto>(data);
}

export async function createModulesPermissions(
  dto: ModulesPermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: ModulesPermissionsUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/ModulesPermissions/ModulesPermissionsCreate",
    payload
  );

  return data;
}

export async function updateModulesPermissions(
  dto: ModulesPermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ModulesPermissions/ModulesPermissionsUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateModulesPermissionsStatus(
  dto: ModulesPermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ModulesPermissions/ModulesPermissionsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
