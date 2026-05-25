import type {
  AccountPlanByIdDto,
  AccountPlanResponseDto,
  AccountPlanStatusDto,
  AccountPlanUpsertDto,
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

export async function fetchAccountPlanList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<AccountPlanResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<AccountPlanResponseDto>>
      | Paginated<AccountPlanResponseDto>
    >("/AccountPlan/AccountPlanList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<AccountPlanResponseDto>>(data);
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

export async function fetchAccountPlanSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/AccountPlan/AccountPlanSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchAccountPlanById(
  AccountPlanId: number
): Promise<AccountPlanByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<AccountPlanByIdDto> | AccountPlanByIdDto
  >("/AccountPlan/AccountPlanById", {
    params: { AccountPlanId: AccountPlanId },
  });

  return unwrap<AccountPlanByIdDto>(data);
}

type AccountPlanCreateDto = Omit<AccountPlanUpsertDto, "AccountPlanId">;
export async function createAccountPlan(
  dto: AccountPlanCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/AccountPlan/AccountPlanCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateAccountPlan(
  dto: AccountPlanUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/AccountPlan/AccountPlanUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateAccountPlanStatus(
  dto: AccountPlanStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/AccountPlan/AccountPlanStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
