import type {
  OperationsWorkOrderProgressPhotoDto,
  OperationsWorkOrderProgressResponseDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import { getBusinessIdFromStorage } from "@/stores";

export async function fetchOperationsWorkOrderProgressList(
  page: number,
  pageSize: number,
  activityId?: number,
  search?: string,
  date?: string,
  operationsId?: number
): Promise<Paginated<OperationsWorkOrderProgressResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsWorkOrderProgressResponseDto>>(
    "/OperationsWorkOrderProgress/GetAll",
    {
      params: { search, page, pageSize, activityId, date, operationsId },
    }
  );
  return data;
}

export async function fetchOperationsWorkOrderProgressPhotos(
  progressId: number
): Promise<OperationsWorkOrderProgressPhotoDto[]> {
  const { data } = await http.get<OperationsWorkOrderProgressPhotoDto[]>(
    `/OperationsWorkOrderProgress/${progressId}/photos`
  );
  return data;
}

export async function createOperationsWorkOrderProgress(
  dto: import("@/application").OperationsWorkOrderProgressCreateDto
): Promise<import("@/sharedKernel").GlobalResponse> {
  const { data } = await http.post<import("@/sharedKernel").GlobalResponse>(
    "/OperationsWorkOrderProgress",
    dto
  );
  return data;
}
