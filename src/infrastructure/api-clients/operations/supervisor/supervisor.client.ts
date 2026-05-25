import type {
  OperationsSupervisorCreateDto,
  OperationsSupervisorResponseDto,
  OperationsSupervisorUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchOperationsSupervisorList(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<OperationsSupervisorResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsSupervisorResponseDto>>(
    "/OperationsSupervisor/GetAll",
    {
      params: { businessId, search, page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsSupervisorById(
  supervisorId: number
): Promise<OperationsSupervisorResponseDto> {
  const { data } = await http.get<OperationsSupervisorResponseDto>(
    "/OperationsSupervisor/GetById",
    {
      params: { supervisorId },
    }
  );
  return data;
}

export async function createOperationsSupervisor(
  dto: OperationsSupervisorCreateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/OperationsSupervisor/Create",
    {
      ...dto,
      businessId,
      createUser: userId,
    }
  );
  return data;
}

export async function updateOperationsSupervisor(
  dto: OperationsSupervisorUpdateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/OperationsSupervisor/Update",
    {
      ...dto,
      businessId,
      updateUser: userId,
    }
  );
  return data;
}

export async function deleteOperationsSupervisor(
  supervisorId: number
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.delete<GlobalResponse>(
    "/OperationsSupervisor/Delete",
    {
      params: { supervisorId, businessId, userId },
    }
  );
  return data;
}
