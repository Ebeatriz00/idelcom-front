import type {
  OperationsSquadCreateDto,
  OperationsSquadResponseDto,
  OperationsSquadUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchOperationsSquadList(
  page: number,
  pageSize: number,
  workOrderId?: number,
  search?: string
): Promise<Paginated<OperationsSquadResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsSquadResponseDto>>(
    "/OperationsSquad/GetAll",
    {
      params: { businessId, workOrderId, search, page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsSquadById(
  squadId: number
): Promise<OperationsSquadResponseDto> {
  const { data } = await http.get<OperationsSquadResponseDto>(
    "/OperationsSquad/GetById",
    {
      params: { squadId },
    }
  );
  return data;
}

export async function createOperationsSquad(
  dto: OperationsSquadCreateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.post<GlobalResponse>("/OperationsSquad/Create", {
    ...dto,
    businessId,
    createUser: userId,
  });
  return data;
}

export async function updateOperationsSquad(
  dto: OperationsSquadUpdateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");
  if (userId == null) throw new Error("UserId no disponible.");

  const { data } = await http.put<GlobalResponse>("/OperationsSquad/Update", {
    ...dto,
    businessId,
    updateUser: userId,
  });
  return data;
}

export async function deleteOperationsSquad(
  squadId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsSquad/Delete",
    {
      params: { squadId },
    }
  );
  return data;
}
