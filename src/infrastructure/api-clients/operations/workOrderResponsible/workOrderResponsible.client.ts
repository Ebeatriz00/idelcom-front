import type {
  OperationsWorkOrderResponsibleCreateDto,
  OperationsWorkOrderResponsibleResponseDto,
  OperationsWorkOrderResponsibleUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage } from "@/stores";

export async function fetchOperationsWorkOrderResponsibleList(
  pageIndex: number,
  pageSize: number,
  search?: string
): Promise<Paginated<OperationsWorkOrderResponsibleResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsWorkOrderResponsibleResponseDto>>(
    "/OperationsWorkOrderResponsible/GetAll",
    {
      params: { businessId, search, page: pageIndex + 1, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsWorkOrderResponsibleById(
  workOrderResponsibleId: number
): Promise<OperationsWorkOrderResponsibleResponseDto> {
  const { data } = await http.get<OperationsWorkOrderResponsibleResponseDto>(
    "/OperationsWorkOrderResponsible/GetById",
    {
      params: { workOrderResponsibleId },
    }
  );
  return data;
}

export async function createOperationsWorkOrderResponsible(
  dto: OperationsWorkOrderResponsibleCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>("/OperationsWorkOrderResponsible/Create", dto);
  return data;
}

export async function updateOperationsWorkOrderResponsible(
  dto: OperationsWorkOrderResponsibleUpdateDto
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>("/OperationsWorkOrderResponsible/Update", dto);
  return data;
}

export async function deleteOperationsWorkOrderResponsible(
  workOrderResponsibleId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsWorkOrderResponsible/Delete",
    {
      params: { workOrderResponsibleId },
    }
  );
  return data;
}
