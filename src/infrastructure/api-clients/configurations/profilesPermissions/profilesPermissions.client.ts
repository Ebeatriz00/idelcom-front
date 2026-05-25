import type { Paginated } from "@/application";
import type {
  ProfilesPermissionsStatusDto,
  ProfilesPermissionsUpsertDto,
} from "@/application/dtos/configurations/ProfilesPermissions/ProfilesPermissions.dto";
import type {
  ProfilesPermissionsByIdDto,
  ProfilesPermissionsResponseDto,
} from "@/application/dtos/configurations/ProfilesPermissions/ProfilesPermissionsResponse.dto";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchProfilesPermissionsList(
  profilesId: number,
  page: number,
  pageSize: number,
  search: string
): Promise<Paginated<ProfilesPermissionsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (profilesId == null) throw new Error("Perfil no disponible.");
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ProfilesPermissionsResponseDto>>
      | Paginated<ProfilesPermissionsResponseDto>
    >("/ProfilesPermissions/ProfilesPermissionsList", {
      params: {
        profilesId: profilesId,
        businessId: bid,
        search,
        page,
        pageSize,
      },
    });

    return unwrap<Paginated<ProfilesPermissionsResponseDto>>(data);
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

export async function fetchProfilesPermissionsById(
  profilesPermissionsId: number
): Promise<ProfilesPermissionsByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<ProfilesPermissionsByIdDto> | ProfilesPermissionsByIdDto
  >("/ProfilesPermissions/ProfilesPermissionsById", {
    params: { profilesPermissionsId: profilesPermissionsId },
  });

  return unwrap<ProfilesPermissionsByIdDto>(data);
}

export async function createProfilesPermissions(
  dto: ProfilesPermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: ProfilesPermissionsUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/ProfilesPermissions/ProfilesPermissionsCreate",
    payload
  );

  return data;
}

export async function updateProfilesPermissions(
  dto: ProfilesPermissionsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ProfilesPermissions/ProfilesPermissionsUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateProfilesPermissionsStatus(
  dto: ProfilesPermissionsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ProfilesPermissions/ProfilesPermissionsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
