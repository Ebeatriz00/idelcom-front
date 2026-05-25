import type {
  OperationPersonnelMovementCreateDto,
  OperationPersonnelMovementResponseDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage } from "@/stores";

export async function fetchOperationPersonnelMovementList(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<OperationPersonnelMovementResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationPersonnelMovementResponseDto>>(
    "/OperationPersonnelMovement/GetAll",
    {
      params: { businessId, search, page, pageSize },
    }
  );
  return data;
}

export async function createOperationPersonnelMovement(
  dto: OperationPersonnelMovementCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/OperationPersonnelMovement/Create",
    dto
  );
  return data;
}
