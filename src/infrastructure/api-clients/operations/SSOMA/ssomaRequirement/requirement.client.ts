import type {
  OptionItem,
  PagedSelect,
  Paginated,
  PersonnelOperationsByWorkerItemDto,
} from "@/application";
import type {
  RequirementByIdDto,
  RequirementResponseItemDto,
  RequirementUpsertDto,
} from "@/application/dtos/operations/requirement/requeriment.dto";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchRequirementList(
  scopeId: number,
  page: number,
  pageSize: number,
  search?: string,
): Promise<Paginated<RequirementResponseItemDto>> {
  const { data } = await http.get<Paginated<RequirementResponseItemDto>>(
    "/SsomaRequirement/GetAllSsomaRequirement",
    {
      params: { scopeId, page, pageSize, search },
    },
  );
  return data;
}

export async function fetchRequirementSelect(
  scopedId: number,
  page: number,
  pageSize: number,
  search: string,
) {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/SsomaRequirement/GetSelectRequirement", {
    params: { scopedId, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchRequirementSpecifications(
  requirementId: number,
): Promise<PersonnelOperationsByWorkerItemDto> {
  const { data } = await http.get<PersonnelOperationsByWorkerItemDto>(
    "/SsomaRequirement/GetGeneralRequirementById",
    {
      params: { requirementId },
    },
  );
  return data;
}

export async function fetchRequirementById(
  requirementId: number,
): Promise<RequirementByIdDto> {
  const { data } = await http.get<RequirementByIdDto>(
    "/SsomaRequirement/GetByIdSsomaRequirement",
    {
      params: { requirementId },
    },
  );
  return data;
}

export async function fetchCreateRequirement(
  payload: RequirementUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.post(
    "/SsomaRequirement/CreateSsomaRequirement",
    payload,
  );
  return data;
}

export async function fetchUpdateRequirement(
  payload: RequirementUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put(
    "/SsomaRequirement/UpdateSsomaRequirement",
    payload,
  );
  return data;
}

export async function fetchDeleteRequirement(
  requirementId: number,
): Promise<GlobalResponse> {
  const { data } = await http.delete(
    "/SsomaRequirement/DeleteSsomaRequirement",
    {
      params: { requirementId },
    },
  );
  return data;
}

export async function fetchUpdateRequirementStatus(payload: {
  requirementId: number;
  status: string;
}): Promise<GlobalResponse> {
  const { data } = await http.post(
    "/SsomaRequirement/UpdateStatusRequirement",
    payload,
  );
  return data;
}
