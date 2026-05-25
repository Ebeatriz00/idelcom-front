import type {
  ModulesResponseDto,
  ModulesStatusDto,
  ModulesUpsertDto,
  OptionItem,
  PagedSelect,
} from "@/application";

import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

function unwrapArray<T>(data: ApiEnvelope<T> | T): T {
  // Ajusta según tu shape real de ApiEnvelope
  if (data && typeof data === "object" && "data" in (data as any)) {
    return (data as any).data as T;
  }
  return data as T;
}

export async function fetchModulesList(
  parentModulesId: number | null,
  search?: string,
  usersId?: number
): Promise<ModulesResponseDto[]> {
  const businessId = getBusinessIdFromStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<ModulesResponseDto[]> | ModulesResponseDto[]
    >("/Modules/ModulesList", {
      params: {
        businessId, // usa el nombre real que espera tu API
        parentModulesId, // null para raíces
        ...(search ? { search } : {}),
        ...(usersId != null ? { usersId } : {}), // pásalo solo si viene
      },
    });

    return unwrapArray<ModulesResponseDto[]>(data) ?? [];
  } catch (err: any) {
    // Si el backend responde 404 cuando no hay módulos, devuelve []
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function fetchModulesSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Modules/ModulesSelect", {
    params: { business_id: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchModulesById(
  modulesId: number
): Promise<ModulesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ModulesResponseDto> | ModulesResponseDto
  >("/Modules/ModulesIdList", {
    params: { modulesId: modulesId },
  });

  return unwrap<ModulesResponseDto>(data);
}

export async function createModules(
  dto: ModulesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: ModulesUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/Modules/ModulesCreate",
    payload
  );

  return data;
}

export async function updateModules(
  dto: ModulesUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Modules/ModulesUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateModulesStatus(
  dto: ModulesStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Modules/ModulesStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
