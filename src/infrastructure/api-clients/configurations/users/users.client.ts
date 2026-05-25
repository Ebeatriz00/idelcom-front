import type {
  Paginated,
  UsersPasswordChangeDto,
  UsersResponseDto,
  UsersResponseIdDto,
  UsersStatusDto,
  UsersUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchUsersList(
  page: number,
  pageSize: number,
  search: string
): Promise<Paginated<UsersResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<UsersResponseDto>> | Paginated<UsersResponseDto>
    >("/Users/UsersList", {
      params: { business_id: bid, search, page, pageSize },
    });

    return unwrap<Paginated<UsersResponseDto>>(data);
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

export async function fetchCodeUsersExist(usersCode: string): Promise<boolean> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const res = await http.get<boolean>("/Users/UserExistsCode", {
      params: { code: usersCode, businessId: bid },
    });

    return res.data === true;
  } catch (error) {
    console.error("❌ Error al verificar código de usuario:", error);
    return false;
  }
}
export async function fetchUsersById(
  UsersId: number
): Promise<UsersResponseIdDto> {
  const { data } = await http.get<
    ApiEnvelope<UsersResponseIdDto> | UsersResponseIdDto
  >("/Users/UsersIdList", {
    params: { usersId: UsersId },
  });

  return unwrap<UsersResponseIdDto>(data);
}

export async function createUsers(
  dto: UsersUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: UsersUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/Users/UsersCreate",
    payload
  );

  return data;
}

export async function updateUsers(
  dto: UsersUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Users/UsersUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateUsersStatus(
  dto: UsersStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Users/UsersStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updatePasswordChange(
  dto: UsersPasswordChangeDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Users/UsersUpdatePassword",
    { ...dto, businessId, usersBy }
  );
  return data;
}
