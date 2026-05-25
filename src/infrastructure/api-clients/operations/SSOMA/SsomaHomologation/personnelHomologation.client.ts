import type {
  HomologationPersonnelRequestDto,
  OptionItem,
  PagedSelect,
  Paginated,
  PersonnelHomologationListItemDto,
  PersonnelOperationsByWorkerItemDto,
  PersonnelOperationsItem,
  SsomaHomologationPersonnelDocumentReplaceDto,
  SsomaHomologationPersonnelDocumentReplaceRequestDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export async function fetchPersonnelHomologationList(
  page: number,
  pageSize: number,
  search?: string,
): Promise<Paginated<PersonnelHomologationListItemDto>> {
  const { data } = await http.get<Paginated<PersonnelHomologationListItemDto>>(
    "/SsomaHomologationPersonnel/GetListAllPersonnelOperations",
    {
      params: { page, pageSize, search },
    },
  );
  return data;
}

export async function fetchDetailPersonnelOperations(
  personnelOperationsId: number,
): Promise<PersonnelOperationsItem> {
  const { data } = await http.get<PersonnelOperationsItem>(
    "/SsomaHomologationPersonnel/GetDetailPersonnelOperations",
    {
      params: { personnelOperationsId },
    },
  );
  return data;
}

export async function fetchByPersonnelHomologationList(
  operationsId: number | undefined,
  workerId: number,
  page: number,
  pageSize: number,
  search?: string,
): Promise<Paginated<PersonnelOperationsByWorkerItemDto>> {
  const { data } = await http.get<
    Paginated<PersonnelOperationsByWorkerItemDto>
  >("/SsomaOperationsRequirement/GetListSsomaOperationsRequirementByWorker", {
    params: { operationsId, workerId, page, pageSize, search },
  });
  return data;
}

export async function fetchSelectOperationsForHomologation(
  page: number,
  pageSize: number,
  search: string,
) {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/SsomaOperationsRequirement/GetSelectOperationsForHomologation", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPersonnelHomologationCreate(
  dto: HomologationPersonnelRequestDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/SsomaHomologationPersonnel/CreateSsomaHomologationPersonnelOrchestrated",
    {
      ...dto,
    },
  );
  return data;
}

export async function fetchReplaceSsomaHomologationPersonnelDocument(
  dto:
    | SsomaHomologationPersonnelDocumentReplaceDto
    | SsomaHomologationPersonnelDocumentReplaceRequestDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/SsomaHomologationPersonnelDocument/ReplaceSsomaHomologationPersonnelDocument",
    {
      ...dto,
    },
  );
  return data;
}
