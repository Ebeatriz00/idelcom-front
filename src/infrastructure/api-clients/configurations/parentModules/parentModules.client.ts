import type {
  Paginated,
  ParentModulesResponseDto,
  ParentModulesStatusDto,
  ParentModulesUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchParentModulesList(
  search: string,
  page: number,
  pageSize: number
): Promise<Paginated<ParentModulesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ParentModulesResponseDto>>
      | Paginated<ParentModulesResponseDto>
    >("/ParentModules/ParentModulesList", {
      params: { businessId: bid, search, page, pageSize },
    });

    return unwrap<Paginated<ParentModulesResponseDto>>(data);
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

export async function fetchParentModulesById(
  parentModulesId: number
): Promise<ParentModulesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ParentModulesResponseDto> | ParentModulesResponseDto
  >("/ParentModules/ParentIdList", {
    params: { parentModulesId: parentModulesId },
  });

  return unwrap<ParentModulesResponseDto>(data);
}

export async function createParentModules(
  dto: ParentModulesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: ParentModulesUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/ParentModules/ParentModulesCreate",
    payload
  );

  return data;
}

export async function updateParentModules(
  dto: ParentModulesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  console.log(dto);
  const { data } = await http.put<GlobalResponse>(
    "/ParentModules/ParentModulesUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateParentModulesStatus(
  dto: ParentModulesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ParentModules/ParentModulesStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
