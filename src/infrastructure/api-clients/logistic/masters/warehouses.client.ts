import type {
  OptionItem,
  PagedSelect,
  Paginated,
  WarehousesResponseDto,
  WarehousesStatusDto,
  WarehousesUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchWarehousesList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<WarehousesResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<WarehousesResponseDto>>
      | Paginated<WarehousesResponseDto>
    >("/Warehouses/WarehousesList", {
      params: { page, pageSize, search },
    });
    return unwrap<Paginated<WarehousesResponseDto>>(data);
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

export async function fetchWarehousesSelect(
  page: number,
  pageSize: number,
  search: string,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Warehouses/WarehousesSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchWarehousesById(
  warehousesId: number,
): Promise<WarehousesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<WarehousesResponseDto> | WarehousesResponseDto
  >("/Warehouses/WarehousesById", {
    params: { WarehousesId: warehousesId },
  });

  return unwrap<WarehousesResponseDto>(data);
}

type WarehousesCreateDto = Omit<WarehousesUpsertDto, "warehousesId">;
export async function createWarehouses(
  dto: WarehousesCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/Warehouses/WarehousesCreate",
    { ...dto },
  );
  return data;
}

export async function updateWarehouses(
  dto: WarehousesUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/Warehouses/WarehousesUpdate",
    { ...dto },
  );
  return data;
}

export async function updateWarehousesStatus(
  dto: WarehousesStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/Warehouses/WarehousesStatus",
    { ...dto },
  );
  return data;
}
