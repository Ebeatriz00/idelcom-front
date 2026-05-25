import type {
  AvailableStockDto,
  Paginated,
  WarehousesMovementByIdDto,
  WarehousesMovementResponseDto,
  WarehousesMovementUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchWarehousesMovementList(
  page: number,
  pageSize: number,
  search: string,
  movementTypeId?: number,
  movOperId?: number,
  warehouseId?: number,
  dateFrom?: string,
  dateTo?: string,
): Promise<Paginated<WarehousesMovementResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<WarehousesMovementResponseDto>>
      | Paginated<WarehousesMovementResponseDto>
    >("/WarehousesMovement/GetAllWarehousesMovement", {
      params: {
        pageNumber: page,
        pageSize,
        search,
        movementTypeId,
        movOperId,
        warehouseId,
        dateFrom,
        dateTo,
      },
    });
    return unwrap<Paginated<WarehousesMovementResponseDto>>(data);
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

export async function fetchWarehousesMovementById(
  warehouseMovementId: number,
): Promise<WarehousesMovementByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<WarehousesMovementByIdDto> | WarehousesMovementByIdDto
  >("/WarehousesMovement/GetByIdWarehousesMovement", {
    params: { id: warehouseMovementId },
  });

  return unwrap<WarehousesMovementByIdDto>(data);
}

export async function fetchAvailableStock(
  warehouseId?: number,
  productsId?: number,
  search?: string,
): Promise<AvailableStockDto[]> {
  const { data } = await http.get<
    ApiEnvelope<AvailableStockDto[]> | AvailableStockDto[]
  >("/WarehousesMovement/GetAvailableStock", {
    params: { warehouseId, productsId, search },
  });

  return unwrap<AvailableStockDto[]>(data);
}

export async function createWarehousesMovement(
  dto: WarehousesMovementUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/WarehousesMovement/WarehousesMovementCreate",
    { ...dto },
  );
  return data;
}
