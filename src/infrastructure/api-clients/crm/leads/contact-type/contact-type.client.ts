import type {
  ContactTypeResponseDto,
  ContactTypeStatusDto,
  ContactTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchContactTypeList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<ContactTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ContactTypeResponseDto>>
      | Paginated<ContactTypeResponseDto>
    >("/ContactType/ContactTypeList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<ContactTypeResponseDto>>(data);
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

export async function fetchContactTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ContactType/ContactTypeSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchContactTypeById(
  contactTypeId: number
): Promise<ContactTypeResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ContactTypeResponseDto> | ContactTypeResponseDto
  >("/ContactType/ContactTypeIdList", {
    params: { contactTypeId: contactTypeId },
  });

  return unwrap<ContactTypeResponseDto>(data);
}

type ContactTypeCreateDto = Omit<ContactTypeUpsertDto, "contactTypeId">;
export async function createContactType(
  dto: ContactTypeCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/ContactType/ContactTypeCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateContactType(
  dto: ContactTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ContactType/ContactTypeUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateContactTypeStatus(
  dto: ContactTypeStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ContactType/ContactTypeStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
