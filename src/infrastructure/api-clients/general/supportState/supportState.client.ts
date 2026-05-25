import type {
  PagedSelect,
  SupportStateGetByIdDto,
  SupportStateSelectDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";

export async function fetchSupportStateSelect(
  page: number,
  pageSize: number,
  search?: string,
): Promise<PagedSelect<SupportStateSelectDto>> {
  const { data } = await http.get<PagedSelect<SupportStateSelectDto>>(
    "/SupportState/Select",
    {
      params: { search, page, pageSize },
    },
  );
  return data;
}

export async function fetchSupportStateById(
  supportStateId: number,
): Promise<SupportStateGetByIdDto> {
  const { data } = await http.get<SupportStateGetByIdDto>(
    "/SupportState/GetById",
    {
      params: { supportStateId },
    },
  );
  return data;
}
