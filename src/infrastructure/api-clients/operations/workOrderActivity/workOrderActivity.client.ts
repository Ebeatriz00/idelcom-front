import type {
  OperationsWorkOrderActivityCreateDto,
  OperationsWorkOrderActivityResponseDto,
  OperationsWorkOrderActivitySelectItem,
  OperationsWorkOrderActivityUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import type { PagedSelect } from "@/application";

export async function fetchOperationsWorkOrderActivitySelect(
  operationsId: number,
  page: number,
  pageSize: number,
  search?: string
): Promise<PagedSelect<OperationsWorkOrderActivitySelectItem>> {
  const { data } = await http.get<PagedSelect<OperationsWorkOrderActivitySelectItem>>(
    "/OperationsWorkOrderActivity/GetSelect",
    {
      params: { operationsId, search, page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsWorkOrderActivityList(
  workOrderId: number,
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<OperationsWorkOrderActivityResponseDto>> {
  const { data } = await http.get<Paginated<OperationsWorkOrderActivityResponseDto>>(
    "/OperationsWorkOrderActivity/GetAll",
    {
      params: { workOrderId, search, page, pageSize },
    }
  );
  return data;
}

export async function createOperationsWorkOrderActivity(
  dto: OperationsWorkOrderActivityCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/OperationsWorkOrderActivity/Create",
    dto
  );
  return data;
}

export async function updateOperationsWorkOrderActivity(
  dto: OperationsWorkOrderActivityUpdateDto
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/OperationsWorkOrderActivity/Update",
    dto
  );
  return data;
}

export async function deleteOperationsWorkOrderActivity(
  activityId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsWorkOrderActivity/Delete",
    {
      params: { activityId },
    }
  );
  return data;
}
