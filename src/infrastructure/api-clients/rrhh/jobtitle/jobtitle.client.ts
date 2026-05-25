import type {
  JobTitleResponseByIdDto,
  JobTitleResponseDto,
} from "@/application/dtos/rrhh/JobTitle/JobTitleResponse.dto";
import http from "@/infrastructure/http/httpClient";

import type { OptionItem, PagedSelect, Paginated } from "@/application";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  JobTitleStatusDto,
  JobTitleUpsertDto,
} from "@/application/dtos/rrhh/JobTitle/JobTitle.dto";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchJobTitleList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<JobTitleResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<JobTitleResponseDto>>
      | Paginated<JobTitleResponseDto>
    >("/JobTitle/JobTitleList", {
      params: { business_id: bid, page, pageSize, search, usersBy },
    });
    return unwrap<Paginated<JobTitleResponseDto>>(data);
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

export async function fetchJobTitleSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/JobTitle/JobTitleSelect", {
    params: { business_id: bid, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchJobTitleById(
  jobTitleId: number
): Promise<JobTitleResponseByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<JobTitleResponseByIdDto> | JobTitleResponseByIdDto
  >("/JobTitle/JobTitleIdList", {
    params: { JobTitleId: jobTitleId },
  });

  return unwrap<JobTitleResponseByIdDto>(data);
}

type JobTitleCreateDto = Omit<JobTitleUpsertDto, "jobTitleId">;
export async function createJobTitle(
  dto: JobTitleCreateDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: JobTitleUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/JobTitle/JobTitleCreate",
    payload
  );
  return data;
}

export async function updateJobTitle(
  dto: JobTitleUpsertDto
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: JobTitleUpsertDto = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.put<GlobalResponse>(
    "/JobTitle/JobTitleUpdate",
    payload
  );
  return data;
}

export async function updateJobTitleStatus(
  dto: JobTitleStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.patch<GlobalResponse>(
    "/JobTitle/JobTitleStatus",
    payload
  );
  return data;
}
