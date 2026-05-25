import {
  type OptionItem,
  type PagedSelect,
  type Paginated,
  type ProductsResponseDto,
  type ProductsStatusDto,
  type ProductsUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}
export async function fetchProductsList(
  page: number,
  pageSize: number,
  search: string,
  categoriesId?: number,
  productTypeId?: number,
  brandsId?: number,
): Promise<Paginated<ProductsResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ProductsResponseDto>>
      | Paginated<ProductsResponseDto>
    >("/Products/ProductsList", {
      params: { categoriesId, productTypeId, brandsId, search, page, pageSize },
    });
    return unwrap<Paginated<ProductsResponseDto>>(data);
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

export async function fetchProductsSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Products/ProductsSelect", {
    params: { search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchProductsById(
  productsId: number,
): Promise<ProductsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ProductsResponseDto> | ProductsResponseDto
  >("/Products/ProductsById", {
    params: { productsId: productsId },
  });

  return unwrap<ProductsResponseDto>(data);
}

// 4. CREAR
type ProductsCreateDto = Omit<ProductsUpsertDto, "productsId">;
export async function createProducts(
  dto: ProductsCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>("/Products/ProductsCreate", {
    ...dto,
  });
  return data;
}

// 5. ACTUALIZAR
export async function updateProducts(
  dto: ProductsUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>("/Products/ProductsUpdate", {
    ...dto,
  });
  return data;
}

// 6. CAMBIAR ESTADO (Activar/Desactivar)
export async function updateProductsStatus(
  dto: ProductsStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/Products/ProductsStatus",
    { ...dto },
  );
  return data;
}
