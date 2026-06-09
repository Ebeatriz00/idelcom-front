import type { 
  OptionItem, 
  PagedSelect,
  ClinicResponseDto,
  ClinicCreateDto,
  ClinicUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchClinicSelect(
  page: number,
  pageSize: number,
  search?: string,
) {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Clinic/Select", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchClinicListItem(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<ClinicResponseDto>> {
  const { data } = await http.get<Paginated<ClinicResponseDto>>(
    "/Clinic/GetAll",
    {
      params: { search, page, pageSize },
    }
  );
  return data;
}

export async function fetchClinicById(
  clinicId: number
): Promise<ClinicResponseDto> {
  const { data } = await http.get<ClinicResponseDto>(
    "/Clinic/GetById",
    {
      params: { clinicId },
    }
  );
  return data;
}

export async function createClinic(
  dto: ClinicCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>("/Clinic/Create", dto);
  return data;
}

export async function updateClinic(
  dto: ClinicUpdateDto
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>("/Clinic/Update", dto);
  return data;
}

export async function deleteClinic(
  clinicId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Clinic/Delete",
    {
      params: { clinicId },
    }
  );
  return data;
}
