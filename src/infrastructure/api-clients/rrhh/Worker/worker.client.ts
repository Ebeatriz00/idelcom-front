import type { OptionItem, PagedSelect, Paginated } from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  WorkerStatusDto,
  WorkerUpsertDto,
} from "@/application/dtos/rrhh/Worker/Worker.dto";
import type { WorkerResponseDto } from "@/application/dtos/rrhh/Worker/WorkerResponse.dto";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchWorkerList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<WorkerResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<WorkerResponseDto>> | Paginated<WorkerResponseDto>
    >("/Worker/WorkerList", {
      params: { business_id: bid, page, pageSize, search, usersBy },
    });
    return unwrap<Paginated<WorkerResponseDto>>(data);
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

export async function fetchWorkerSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Worker/WorkerSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchSalesWorkerSelect(
  page: number,
  pageSize: number,
  search: string
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Worker/WorkerSalesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchWorkerProyectSelect(
  page: number,
  pageSize: number,
  search: string
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Worker/WorkerProyectSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchWorkerOperationsSelect(
  page: number,
  pageSize: number,
  search: string
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Worker/WorkerOperationsSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchWorkerSquadSelect(
  operationsId: number,
  page: number,
  pageSize: number,
  search: string
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Worker/WorkerSquadSelect", {
    params: { business_id: bid, operations_id: operationsId, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchWorkerById(
  workerId: number
): Promise<WorkerResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<WorkerResponseDto> | WorkerResponseDto
  >("/Worker/WorkerIdList", {
    params: { WorkerId: workerId },
  });

  return unwrap<WorkerResponseDto>(data);
}

type WorkerCreateDto = Omit<WorkerUpsertDto, "workerId">;
export async function createWorker(
  dto: WorkerCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Worker/WorkerCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateWorker(
  dto: WorkerUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Worker/WorkerUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateWorkerStatus(
  dto: WorkerStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Worker/WorkerStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
