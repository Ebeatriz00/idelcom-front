import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProductTypesResponseDto,
  ProductTypesStatusDto,
  ProductTypesUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchProductTypesList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<ProductTypesResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ProductTypesResponseDto>>
      | Paginated<ProductTypesResponseDto>
    >("/ProductTypes/ProductTypesList", {
      params: { search, page, pageSize },
    });
    return unwrap<Paginated<ProductTypesResponseDto>>(data);
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

export async function fetchProductTypesSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ProductTypes/ProductTypesSelect", {
    params: { search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchProductTypesById(
  productTypesId: number,
): Promise<ProductTypesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ProductTypesResponseDto> | ProductTypesResponseDto
  >("/ProductTypes/ProductTypesById", {
    params: { productTypesId: productTypesId },
  });

  return unwrap<ProductTypesResponseDto>(data);
}

type ProductTypesCreateDto = Omit<ProductTypesUpsertDto, "productTypesId">;
export async function createProductTypes(
  dto: ProductTypesCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/ProductTypes/ProductTypesCreate",
    { ...dto },
  );
  return data;
}

export async function updateProductTypes(
  dto: ProductTypesUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/ProductTypes/ProductTypesUpdate",
    { ...dto },
  );
  return data;
}

export async function updateProductTypesStatus(
  dto: ProductTypesStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/ProductTypes/ProductTypesStatus",
    { ...dto },
  );
  return data;
}
