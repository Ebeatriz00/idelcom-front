import http from "@/infrastructure/http/httpClient";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  ContactsStatusDto,
  ContactsUpsertDto,
} from "@/application/dtos/crm/contacts/Contacts.dto";
import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };
function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchContactsList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number,
): Promise<Paginated<ContactsResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ContactsResponseDto>>
      | Paginated<ContactsResponseDto>
    >("/ContactsCrm/ContactsCrmList", {
      params: {
        business_id: bid,
        search,
        page,
        pageSize,
        usersBy,
      },
    });
    return unwrap<Paginated<ContactsResponseDto>>(data);
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

export async function fetchContactsSelect(
  clientsId: number,
  page: number,
  search: string,
  pageSize: number,
  workerId?: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ContactsCrm/ContactsCrmSelect", {
    params: { business_id: bid, clientsId, workerId, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchContactsById(
  contactsId: number,
): Promise<ContactsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ContactsResponseDto> | ContactsResponseDto
  >("/ContactsCrm/ContactsCrmById", {
    params: { contactsCrmId: contactsId },
  });

  return unwrap<ContactsResponseDto>(data);
}

type ContactsCreateDto = Omit<ContactsUpsertDto, "contactsId">;

export async function createContacts(
  dto: ContactsCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/ContactsCrm/ContactsCrmCreate",
    { ...dto, businessId, usersBy: usersBy.toString() },
  );
  return data;
}

export async function updateContacts(
  dto: ContactsUpsertDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/ContactsCrm/ContactsCrmUpdate",
    { ...dto, businessId, usersBy: usersBy.toString() },
  );
  return data;
}

export async function updateContactsStatus(
  dto: ContactsStatusDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/ContactsCrm/ContactsCrmStatus",
    { ...dto, businessId, usersBy: usersBy.toString() },
  );
  return data;
}
