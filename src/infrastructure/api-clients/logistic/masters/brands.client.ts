import type {
  BrandsResponseDto,
  BrandsStatusDto,
  BrandsUpsertDto,
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

export async function fetchBrandsList(
  page: number,
  pageSize: number,
  search: string,
): Promise<Paginated<BrandsResponseDto>> {
  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<BrandsResponseDto>> | Paginated<BrandsResponseDto>
    >("/Brands/BrandsList", {
      params: { search, page, pageSize },
    });
    return unwrap<Paginated<BrandsResponseDto>>(data);
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

export async function fetchBrandsSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Brands/BrandsSelect", {
    params: { search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchBrandsById(
  brandsId: number,
): Promise<BrandsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<BrandsResponseDto> | BrandsResponseDto
  >("/Brands/BrandsById", {
    params: { brandsId: brandsId },
  });

  return unwrap<BrandsResponseDto>(data);
}

type BrandsCreateDto = Omit<BrandsUpsertDto, "brandsId">;
export async function createBrands(
  dto: BrandsCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>("/Brands/BrandsCreate", {
    ...dto,
  });
  return data;
}

export async function updateBrands(
  dto: BrandsUpsertDto,
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>("/Brands/BrandsUpdate", {
    ...dto,
  });
  return data;
}

export async function updateBrandsStatus(
  dto: BrandsStatusDto,
): Promise<GlobalResponse> {
  const { data } = await http.patch<GlobalResponse>("/Brands/BrandsStatus", {
    ...dto,
  });
  return data;
}
