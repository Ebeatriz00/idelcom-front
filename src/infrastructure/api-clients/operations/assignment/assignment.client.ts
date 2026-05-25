import type {
  OperationsPersonnelAssignmentCreateDto,
  OperationsPersonnelAssignmentResponseDto,
  OperationsPersonnelAssignmentUpdateDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage } from "@/stores";

export async function fetchOperationsPersonnelAssignmentList(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<OperationsPersonnelAssignmentResponseDto>> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<Paginated<OperationsPersonnelAssignmentResponseDto>>(
    "/OperationsPersonnelAssignment/GetAll",
    {
      params: { businessId, search, page, pageSize },
    }
  );
  return data;
}

export async function fetchOperationsPersonnelAssignmentById(
  assignmentId: number
): Promise<OperationsPersonnelAssignmentResponseDto> {
  const { data } = await http.get<OperationsPersonnelAssignmentResponseDto>(
    "/OperationsPersonnelAssignment/GetById",
    {
      params: { assignmentId },
    }
  );
  return data;
}

export async function createOperationsPersonnelAssignment(
  dto: OperationsPersonnelAssignmentCreateDto
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/OperationsPersonnelAssignment/Create",
    dto
  );
  return data;
}

export async function updateOperationsPersonnelAssignment(
  dto: OperationsPersonnelAssignmentUpdateDto
): Promise<GlobalResponse> {
  const { data } = await http.put<GlobalResponse>(
    "/OperationsPersonnelAssignment/Update",
    dto
  );
  return data;
}

export async function deleteOperationsPersonnelAssignment(
  assignmentId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsPersonnelAssignment/Delete",
    {
      params: { assignmentId },
    }
  );
  return data;
}
