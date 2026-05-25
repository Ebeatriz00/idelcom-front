import type {
  Paginated,
  SsomaProcessByIdDto,
  SsomaProcessResponseDto,
  SsomaProcessUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchSsomaProcessList(
  page: number,
  pageSize: number,
  operationsId?: number | null,
  search?: string,
): Promise<Paginated<SsomaProcessResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const params: {
    businessId: number;
    search?: string;
    page: number;
    pageSize: number;
    operationsId?: number;
  } = { businessId, search, page, pageSize };

  if (operationsId && operationsId > 0) {
    params.operationsId = operationsId;
  }

  const { data } = await http.get<Paginated<SsomaProcessResponseDto>>(
    "/SsomaProcess/GetAllSsomaProcess",
    {
      params,
    },
  );
  return data;
}

export async function fetchSsomaProcessById(
  ssomaProcessId: number,
  operationsId: number,
): Promise<SsomaProcessByIdDto> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<SsomaProcessByIdDto>(
    "/SsomaProcess/GetByIdSsomaProcess",
    {
      params: { ssomaProcessId, operationsId, businessId },
    },
  );
  return data;
}

export async function createSsomaProcess(
  dto: SsomaProcessUpsertDto,
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.post<GlobalResponse>(
    "/SsomaProcess/CreateSsomaProcess",
    {
      ...dto,
      BusinessId: Number(businessId),
      CreateUser: Number(userId),
    },
  );
  return data;
}

export async function updateSsomaProcess(
  dto: SsomaProcessUpsertDto,
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.put<GlobalResponse>(
    "/SsomaProcess/UpdateSsomaProcess",
    {
      ...dto,
      BusinessId: Number(businessId),
      UpdateUser: Number(userId),
    },
  );
  return data;
}

export async function deleteSsomaProcess(
  ssomaProcessId: number,
  operationsId: number,
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.delete<GlobalResponse>(
    "/SsomaProcess/DeleteSsomaProcess",
    {
      params: { ssomaProcessId, operationsId, businessId, userId },
    },
  );
  return data;
}
