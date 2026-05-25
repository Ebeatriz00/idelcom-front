import type {
  SsomaDocumentTypeByIdDto,
  SsomaDocumentTypeResponseDto,
  SsomaDocumentTypeStatusDto,
  SsomaDocumentTypeUpsertDto,
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

export async function fetchSsomaDocumentTypesList(
  search: string,
  page: number,
  pageSize: number,
): Promise<Paginated<SsomaDocumentTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<SsomaDocumentTypeResponseDto>>
      | Paginated<SsomaDocumentTypeResponseDto>
    >("/SsomaDocumentType/SsomaDocumentTypeList", {
      params: {
        business_id: bid, // Mapeado al [FromQuery] business_id del controlador
        search,
        page,
        pageSize,
      },
    });
    return unwrap<Paginated<SsomaDocumentTypeResponseDto>>(data);
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

export async function fetchSsomaDocumentTypeSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/SsomaDocumentType/SsomaDocumentTypeSelect", {
    params: {
      business_id: bid,
      search,
      page,
      pageSize,
    },
  });
  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchSsomaDocumentTypeById(
  ssomaDocumentTypeId: number,
): Promise<SsomaDocumentTypeByIdDto> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<SsomaDocumentTypeByIdDto> | SsomaDocumentTypeByIdDto
  >("/SsomaDocumentType/SsomaDocumentTypeIdList", {
    params: {
      ssomaDocumentTypeId, // Enviado por Query como espera el controlador
    },
  });
  return unwrap<SsomaDocumentTypeByIdDto>(data);
}

type SsomaDocumentTypeCreateDto = Omit<SsomaDocumentTypeUpsertDto, "linkToken">;

export async function fetchCreateSsomaDocumentType(
  dto: SsomaDocumentTypeCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/SsomaDocumentType/SsomaDocumentTypeCreate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchUpdateSsomaDocumentType(
  dto: SsomaDocumentTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/SsomaDocumentType/SsomaDocumentTypeUpdate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchUpdateSsomaDocumentTypeStatus(
  dto: SsomaDocumentTypeStatusDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  // Usamos .patch() porque el controlador en C# usa [HttpPatch]
  const { data } = await http.patch<GlobalResponse>(
    "/SsomaDocumentType/SsomaDocumentTypeStatus",
    { ...dto, businessId, usersBy },
  );
  return data;
}