import type {
  CategoriesResponseDto,
  CategoriesStatusDto,
  CategoriesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchCategoriesList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<CategoriesResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<CategoriesResponseDto>>
      | Paginated<CategoriesResponseDto>
    >("/Categories/CategoriesList", {
      params: { search, page, pageSize },
    });
    return unwrap<Paginated<CategoriesResponseDto>>(data);
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

export async function fetchCategoriesSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Categories/CategoriesSelect", {
    params: { search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchCategoriesById(
  categoriesId: number,
): Promise<CategoriesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<CategoriesResponseDto> | CategoriesResponseDto
  >("/Categories/CategoriesById", {
    params: { categoriesId: categoriesId },
  });

  return unwrap<CategoriesResponseDto>(data);
}

type CategoriesCreateDto = Omit<CategoriesUpsertDto, "categoriesId">;
export async function createCategories(
  dto: CategoriesCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/Categories/CategoriesCreate",
    { ...dto },
  );
  return data;
}

export async function updateCategories(
  dto: CategoriesUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/Categories/CategoriesUpdate",
    { ...dto },
  );
  return data;
}

export async function updateCategoriesStatus(
  dto: CategoriesStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>(
    "/Categories/CategoriesStatus",
    { ...dto },
  );
  return data;
}
