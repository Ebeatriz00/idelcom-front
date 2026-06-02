import type {
  OperationsCreateDto,
  OperationsResponseDto,
  OperationsUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

export async function fetchOperationsList(
  page: number,
  pageSize: number
): Promise<Paginated<OperationsResponseDto>> {
  const { data } = await http.get<Paginated<OperationsResponseDto>>(
    "/Operations/GetAll",
    {
      params: { page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsById(
  operationsId: number
): Promise<OperationsResponseDto> {
  const { data } = await http.get<OperationsResponseDto>(
    "/Operations/GetById",
    {
      params: { operationsId },
    }
  );
  return data;
}

export async function createOperations(
  dto: OperationsCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/Operations/Create",
    dto
  );
  return data;
}

export async function updateOperations(
  dto: OperationsUpdateDto & { closurePdfFile?: File }
): Promise<GlobalResponse> {
  const formData = new FormData();

  for (const key in dto) {
    const val = (dto as any)[key];
    if (val !== undefined && val !== null) {
      if (val instanceof Date) {
        formData.append(key, val.toISOString());
      } else if (val instanceof File) {
        formData.append(key, val);
      } else {
        formData.append(key, String(val));
      }
    }
  }

  const { data } = await http.put<GlobalResponse>(
    "/Operations/Update",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteOperations(
  operationsId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Operations/Delete",
    {
      params: { operationsId },
    }
  );
  return data;
}
