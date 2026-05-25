import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProductLinesByIdDto,
  ProductLinesResponseDto,
  ProductLinesStatusDto,
  ProductLinesUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchProductLinesList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<ProductLinesResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ProductLinesResponseDto>>
      | Paginated<ProductLinesResponseDto>
    >("/ProductLines/ProductLinesList", {
      params: { search, page, pageSize },
    });
    return unwrap<Paginated<ProductLinesResponseDto>>(data);
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

export async function fetchProductLinesSelect(
  page: number,
  search: string,
  pageSize: number,
  categoriesId?: number | null,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/ProductLines/ProductLinesSelect", {
    params: { search, page, pageSize, categoriesId },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchProductLinesById(
  productLinesId: number,
): Promise<ProductLinesByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<ProductLinesByIdDto> | ProductLinesByIdDto
  >("/ProductLines/ProductLinesById", {
    params: { productLinesId: productLinesId },
  });

  return unwrap<ProductLinesByIdDto>(data);
}

type ProductLinesCreateDto = Omit<ProductLinesUpsertDto, "productLinesId">;
export async function createProductLines(
  dto: ProductLinesCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/ProductLines/ProductLinesCreate",
    { ...dto },
  );
  return data;
}

export async function updateProductLines(
  dto: ProductLinesUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/ProductLines/ProductLinesUpdate",
    { ...dto },
  );
  return data;
}

export async function updateProductLinesStatus(
  dto: ProductLinesStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/ProductLines/ProductLinesStatus",
    { ...dto },
  );
  return data;
}
