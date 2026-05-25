import type {
  OptionItem,
  PagedSelect,
  Paginated,
  SuppliersResponseDto,
  SuppliersStatusDto,
  SuppliersUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchSuppliersList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<SuppliersResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<SuppliersResponseDto>>
      | Paginated<SuppliersResponseDto>
    >("/Suppliers/SuppliersList", {
      params: { page, pageSize, search },
    });
    return unwrap<Paginated<SuppliersResponseDto>>(data);
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

export async function fetchSuppliersSelect(
  page: number,
  pageSize: number,
  search: string,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Suppliers/SuppliersSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchSuppliersById(
  suppliersId: number,
): Promise<SuppliersResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<SuppliersResponseDto> | SuppliersResponseDto
  >("/Suppliers/SuppliersById", {
    params: { suppliersId: suppliersId },
  });

  return unwrap<SuppliersResponseDto>(data);
}

type SuppliersCreateDto = Omit<SuppliersUpsertDto, "suppliersId">;
export async function createSuppliers(
  dto: SuppliersCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/Suppliers/SuppliersCreate",
    { ...dto },
  );
  return data;
}

export async function updateSuppliers(
  dto: SuppliersUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/Suppliers/SuppliersUpdate",
    { ...dto },
  );
  return data;
}

export async function updateSuppliersStatus(
  dto: SuppliersStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/Suppliers/SuppliersStatus",
    { ...dto },
  );
  return data;
}
