import {
  adaptOpportunity,
  type ActivityOpporCreateDto,
  type ActivityOpporDeleteDto,
  type ActivityPriorityOpporDto,
  type ActivityStateOpporDto,
  type FileTrackingOpperDeleteDto,
  type FileTrackingOpporCreateDto,
  type HiringFileItemDto,
  type OpportunitiesByIdDto,
  type OpportunitiesClientsGetByIdDto,
  type OpportunitiesClientsUpdateDto,
  type OpportunitiesDetailDto,
  type OpportunitiesResponseDto,
  type OpportunitiesStateUpdateDto,
  type OpportunitiesStatusDto,
  type OpportunitiesUploadNewVerDto,
  type OpportunitiesUpsertDto,
  type OptionItem,
  type PagedSelect,
  type Paginated,
} from "@/application";
import type { OpportunitiesRaw } from "@/core/entities/opportunity.entities";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

function formatDateOnly(value?: Date | string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function withOpportunityDateOnlyFields<T extends OpportunitiesUpsertDto>(
  dto: T,
): T {
  return {
    ...dto,
    dateRegister: formatDateOnly(dto.dateRegister) as any,
    dateFinish: formatDateOnly(dto.dateFinish) as any,
    consultDate: formatDateOnly(dto.consultDate) as any,
    quoDate: formatDateOnly(dto.quoDate) as any,
    deliverablesHiring: dto.deliverablesHiring?.map((item) => ({
      ...item,
      dueDate: formatDateOnly(item.dueDate) as any,
    })),
  };
}

type UploadArgs = {
  dto: OpportunitiesStateUpdateDto;
  onProgress?: (pct: number) => void;
};

export async function fetchOpportunitiesCode(): Promise<string> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<string>("/Opportunities/OpportunitiesCode", {
    params: { businessId: bid },
  });
  return data;
}

function appendFormData(fd: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;

  if (value instanceof File) {
    fd.append(key, value);
    return;
  }

  if (value instanceof Date) {
    fd.append(key, value.toISOString());
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormData(fd, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      appendFormData(fd, `${key}.${k}`, v);
    });
    return;
  }

  fd.append(key, String(value));
}

export async function fetchOpportunitiesList(
  page: number,
  pageSize: number,
  search: string,
  workerId?: number,
  stateId?: number,
  filterStartDate?: Date,
  filterFinishDate?: Date,
  filterYear?: number,
): Promise<Paginated<OpportunitiesResponseDto>> {
  const bid = getBusinessIdFromStorage();
  const uid = getUserIdFromtStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  if (uid == null) throw new Error("usersId no disponible.");

  const params: any = {
    businessId: bid,
    usersId: uid,
    search,
    page,
    pageSize,
    workerId,
    filterStartDate,
    filterFinishDate,
    filterYear,
  };

  if (stateId !== undefined) {
    params.stateId = stateId;
  }

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<OpportunitiesResponseDto>>
      | Paginated<OpportunitiesResponseDto>
    >("/Opportunities/OpportunitiesList", {
      params,
    });
    return unwrap<Paginated<OpportunitiesResponseDto>>(data);
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

export async function fetchOpportunitiesSelect(
  clientsId: number,
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Opportunities/OpportunitiesSelect", {
    params: { businessId: bid, clientsId: clientsId, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchFlowTypeSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Opportunities/FlowTypeSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchDeliverablesOptions(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Opportunities/OpportunitiesSelectDeliverables", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchDeliverablesHiringOptions(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Opportunities/OpportunitiesSelectDeliverablesHiring", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchOpportunitiesById(
  linkToken: string,
): Promise<OpportunitiesByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<OpportunitiesByIdDto> | OpportunitiesByIdDto
  >("/Opportunities/OpportunitiesById", {
    params: { linkToken: linkToken },
  });

  return unwrap<OpportunitiesByIdDto>(data);
}

type OpportunitiesCreateDto = Omit<OpportunitiesUpsertDto, "linkToken">;
export async function createOpportunities(
  dto: OpportunitiesCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/Opportunities/OpportunitiesCreate",
    { ...withOpportunityDateOnlyFields(dto), businessId, usersBy },
  );
  return data;
}

export type AttachHiringFilesInput = {
  opporId: number;
  files: HiringFileItemDto[];
};

export async function attachHiringFilesApi(
  input: AttachHiringFilesInput,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    `/Opportunities/Opportunities/${input.opporId}/HiringFiles`,
    {
      businessId,
      opporId: input.opporId, // ✅ el mismo de la ruta
      updateUser: usersBy,
      files: input.files,
    },
  );

  return data;
}

export async function updateOpportunities(
  dto: OpportunitiesUpsertDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Opportunities/OpportunitiesUpdate",
    { ...withOpportunityDateOnlyFields(dto), businessId, usersBy },
  );
  return data;
}

export async function opportunitiesUpdateClient(
  dto: OpportunitiesClientsUpdateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Opportunities/OpportunitiesUpdateClient",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function opportunitiesUpdateState({
  dto,
  onProgress,
}: UploadArgs) {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: OpportunitiesStateUpdateDto = { ...dto, businessId, usersBy };

  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => appendFormData(fd, k, v));

  const { data } = await http.put<GlobalResponse>(
    "/Opportunities/OpportunitiesUpdateState",
    fd,
    {
      onUploadProgress: (e: { total: number; loaded: number }) => {
        if (!e.total) return;
        const pct = Math.min(100, Math.round((e.loaded * 100) / e.total));
        onProgress?.(pct);
      },
    },
  );

  return data;
}

export async function fetchUploadNewQuotaVer({ dto, onProgress }: UploadArgs) {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: OpportunitiesUploadNewVerDto = { ...dto, businessId, usersBy };

  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => appendFormData(fd, k, v));

  const { data } = await http.put<GlobalResponse>(
    "/Opportunities/UploadQuotationNewVer",
    fd,
    {
      onUploadProgress: (e: { total: number; loaded: number }) => {
        if (!e.total) return;
        const pct = Math.min(100, Math.round((e.loaded * 100) / e.total));
        onProgress?.(pct);
      },
    },
  );

  return data;
}

export async function fetchQuotationVerNoSelect(
  page: number,
  resourceId: string,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Opportunities/SelectQuotatationVerNo", {
    params: { businessId: bid, linkToken: resourceId, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function opportunitiesUpdateDeliverables(
  dto: OpportunitiesStateUpdateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Opportunities/OpportunitiesUpdateDeliverables",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchOpportunitiesClientsById(
  linkToken: string,
): Promise<OpportunitiesClientsGetByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<OpportunitiesClientsGetByIdDto> | OpportunitiesClientsGetByIdDto
  >("/Opportunities/OpportunitiesByIdClient", {
    params: { linkToken: linkToken },
  });

  return unwrap<OpportunitiesClientsGetByIdDto>(data);
}

export async function fetchOpportunitiesStateById(
  linkToken: string,
): Promise<OpportunitiesStateUpdateDto> {
  const { data } = await http.get<
    ApiEnvelope<OpportunitiesStateUpdateDto> | OpportunitiesStateUpdateDto
  >("/Opportunities/OpportunitiesByIdState", {
    params: { linkToken: linkToken },
  });

  return unwrap<OpportunitiesStateUpdateDto>(data);
}

export async function updateOpportunitiesStatus(
  dto: OpportunitiesStatusDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Opportunities/OpportunitiesStatus",
    { ...dto, businessId, usersBy },
  );
  return data;
}

// DETALLE
export async function fetchDetailOpportunities(
  linkToken: string,
  usersBy?: number,
): Promise<OpportunitiesDetailDto> {
  const businessId = getBusinessIdFromStorage();

  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<
    ApiEnvelope<OpportunitiesDetailDto> | OpportunitiesDetailDto
  >("/Opportunities/OpportunitiesDetail", {
    params: { linkToken: linkToken, businessId: businessId, usersBy: usersBy },
  });

  const raw: OpportunitiesRaw = Array.isArray(data)
    ? (data[0] as OpportunitiesRaw)
    : (data as OpportunitiesRaw);
  if (!raw) throw new Error("No se encontró el detalle de oportunidad.");

  return adaptOpportunity(raw);
}

export async function createFileTrackingOppor(
  dto: FileTrackingOpporCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/FileTracking/FileTrackingOpporCreate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function deleteFileTrackingOppor(
  dto: FileTrackingOpperDeleteDto,
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/FileTracking/FileTrackingOpporDelete",
    {
      data: dto,
    },
  );

  return data;
}

export async function createActivityOppor(
  dto: ActivityOpporCreateDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const workerOwnerId = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/Activity/ActivityOpporCreate",
    { ...dto, businessId, workerOwnerId, usersBy },
  );
  return data;
}
export async function updateActivityChangeState(
  dto: ActivityStateOpporDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Activity/ActivityStateChange",
    { ...dto, businessId, usersBy },
  );
  return data;
}
export async function updateActivityChangePriorityState(
  dto: ActivityPriorityOpporDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Activity/ActivityPriorityStateChange",
    { ...dto, businessId, usersBy },
  );
  return data;
}
export async function deleteActivityOppor(
  dto: ActivityOpporDeleteDto,
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Activity/ActivityOpporDelete",
    {
      data: dto,
    },
  );

  return data;
}
