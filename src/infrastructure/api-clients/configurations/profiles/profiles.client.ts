import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProfileUpsertDto,
} from "@/application";
import type { ProfilesResposeDto } from "@/application/dtos/configurations/Profiles/PorfilesResponse.dto";
import type { ProfileStatusDto } from "@/application/dtos/configurations/Profiles/Profiles.dto";
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

export async function fetchProfilesList(
  search: string,
  page: number,
  pageSize: number
): Promise<Paginated<ProfilesResposeDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<ProfilesResposeDto>> | Paginated<ProfilesResposeDto>
    >("/Profiles/ProfilesList", {
      params: { business_id: bid, search, page, pageSize },
    });
    return unwrap<Paginated<ProfilesResposeDto>>(data);
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

export async function fetchProfilesSelect(
  search: string,
  page: number,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Profiles/ProfilesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
export async function fetchProfileById(
  profilesId: number
): Promise<ProfilesResposeDto> {
  const { data } = await http.get<
    ApiEnvelope<ProfilesResposeDto> | ProfilesResposeDto
  >("/Profiles/ProfilesIdList", {
    params: { ProfilesId: profilesId },
  });

  return unwrap<ProfilesResposeDto>(data);
}

type ProfileCreateDto = Omit<ProfileUpsertDto, "profilesId">;
export async function createProfile(
  dto: ProfileCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Profiles/ProfilesCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateProfile(
  dto: ProfileUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Profiles/ProfilesUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateProfileStatus(
  dto: ProfileStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Profiles/ProfilesStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
