import type {
  OptionItem,
  PagedSelect,
  Paginated,
  PaymentTypeResponseDto,
  PaymentTypeStatusDto,
  PaymentTypeUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchPaymentTypeList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<PaymentTypeResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<PaymentTypeResponseDto>>
      | Paginated<PaymentTypeResponseDto>
    >("/PaymentType/PaymentTypeList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<PaymentTypeResponseDto>>(data);
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

export async function fetchPaymentTypeSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/PaymentType/PaymentTypeSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPaymentTypeById(
  paymentTypeId: number
): Promise<PaymentTypeResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<PaymentTypeResponseDto> | PaymentTypeResponseDto
  >("/PaymentType/PaymentTypeById", {
    params: { paymentTypeId: paymentTypeId }, 
  });

  return unwrap<PaymentTypeResponseDto>(data);
}

type PaymentTypeCreateDto = Omit<PaymentTypeUpsertDto, "PaymentTypeId">;
export async function createPaymentType(
  dto: PaymentTypeCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/PaymentType/PaymentTypeCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updatePaymentType(
  dto: PaymentTypeUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/PaymentType/PaymentTypeUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updatePaymentTypeStatus(
  dto: PaymentTypeStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/PaymentType/PaymentTypeStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
