import type {
  AccountResponseDto,
  AccountStatusDto,
  AccountUpsertDto,
  OptionItem,
  PagedSelect,
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
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchAccountList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<AccountResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<AccountResponseDto>> | Paginated<AccountResponseDto>
    >("/Account/AccountList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<AccountResponseDto>>(data);
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

export async function fetchAccountSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Account/AccountSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchAccountById(
  accountId: number
): Promise<AccountResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<AccountResponseDto> | AccountResponseDto
  >("/Account/AccountById", {
    params: { accountId: accountId },
  });

  return unwrap<AccountResponseDto>(data);
}

type AccountCreateDto = Omit<AccountUpsertDto, "accountId">;
export async function createAccount(
  dto: AccountCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Account/AccountCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateAccount(
  dto: AccountUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Account/AccountUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateAccountStatus(
  dto: AccountStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Account/AccountStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
