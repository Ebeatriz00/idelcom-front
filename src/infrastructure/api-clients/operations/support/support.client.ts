import type {
  SupportCreateDto,
  SupportResponseDto,
  SupportUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

export async function fetchSupportList(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<SupportResponseDto>> {
  const { data } = await http.get<Paginated<SupportResponseDto>>(
    "/Support/GetAll",
    {
      params: { search, page, pageSize },
    }
  );
  return data;
}

export async function fetchSupportById(
  supportId: number
): Promise<SupportResponseDto> {
  const { data } = await http.get<SupportResponseDto>(
    "/Support/GetById",
    {
      params: { supportId },
    }
  );
  return data;
}

export async function createSupport(
  dto: SupportCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>("/Support/Create", dto);
  return data;
}

export async function updateSupport(
  dto: SupportUpdateDto
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>("/Support/Update", dto);
  return data;
}

export async function deleteSupport(
  supportId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Support/Delete",
    {
      params: { supportId },
    }
  );
  return data;
}
