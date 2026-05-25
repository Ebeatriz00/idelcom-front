import type {
  OperationsWorkOrderCreateDto,
  OperationsWorkOrderResponseDto,
  OperationsWorkOrderUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchOperationsWorkOrderList(
  page: number,
  pageSize: number,
  operationsId?: number,
  search?: string
): Promise<Paginated<OperationsWorkOrderResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsWorkOrderResponseDto>>(
    "/OperationsWorkOrder/GetAll",
    {
      params: { businessId, operationsId, search, page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsWorkOrderById(
  workOrderId: number
): Promise<OperationsWorkOrderResponseDto> {
  const { data } = await http.get<OperationsWorkOrderResponseDto>(
    "/OperationsWorkOrder/GetById",
    {
      params: { workOrderId },
    }
  );
  return data;
}

export async function createOperationsWorkOrder(
  dto: OperationsWorkOrderCreateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.post<GlobalResponse>("/OperationsWorkOrder/Create", {
    ...dto,
    businessId,
    createUser: userId,
  });
  return data;
}

export async function updateOperationsWorkOrder(
  dto: OperationsWorkOrderUpdateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.put<GlobalResponse>("/OperationsWorkOrder/Update", {
    ...dto,
    businessId,
    updateUser: userId,
  });
  return data;
}

export async function deleteOperationsWorkOrder(
  workOrderId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsWorkOrder/Delete",
    {
      params: { workOrderId },
    }
  );
  return data;
}
