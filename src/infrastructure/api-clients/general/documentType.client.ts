import http from "@/infrastructure/http/httpClient";

import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  DocumentTypeResponseDto,
  DocumentTypeStatusDto,
  DocumentTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchDocumentTypesList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<DocumentTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<DocumentTypeResponseDto>>
      | Paginated<DocumentTypeResponseDto>
    >("/DocumentTypes/DocumentTypesList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<DocumentTypeResponseDto>>(data);
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

export async function fetchDocumentTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >(
    "/DocumentTypes/DocumentTypeSelect",
    // FIX: Changed 'businessId' to 'business_id' for consistency with other select/list endpoints.
    {
      params: { business_id: bid, search, page, pageSize },
    }
  );

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchDocumentTypeById(
  documentTypeId: number
): Promise<DocumentTypeResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<DocumentTypeResponseDto> | DocumentTypeResponseDto
  >("/DocumentTypes/DocumentTypeIdList", {
    params: { DocumentTypeId: documentTypeId },
  });

  return unwrap<DocumentTypeResponseDto>(data);
}

type DocumentTypeCreateDto = Omit<DocumentTypeUpsertDto, "documentTypeId">;
export async function createDocumentType(
  dto: DocumentTypeCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/DocumentTypes/DocumentTypesCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateDocumentType(
  dto: DocumentTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/DocumentTypes/DocumentTypesUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateDocumentTypeStatus(
  dto: DocumentTypeStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/DocumentTypes/DocumentTypesStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
