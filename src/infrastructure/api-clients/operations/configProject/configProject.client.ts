import type {
  OperationsProjectConfigCreateDto,
  OperationsProjectConfigResponseDto,
  OperationsProjectConfigUpdateDto,
} from "@/application/dtos/operations/configProject/configProject.dto";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";


export async function fetchAllOperationsProjectConfigs(operationsId: number) {
  const { data } = await http.get<OperationsProjectConfigResponseDto[]>(
    "/OperationsProjectConfig/GetAllOperationsProjectConfig",
    {
      params: { operationsId },
    },
  );
  return data;
}


export async function fetchOperationsProjectConfigById(
  operationsProjectConfigId: number,
  operationsId: number,
) {
  const { data } = await http.get<OperationsProjectConfigResponseDto>(
    "/OperationsProjectConfig/GetByIdOperationsProjectConfig",
    {
      params: { operationsProjectConfigId, operationsId },
    },
  );
  return data;
}


export async function createOperationsProjectConfig(
  dto: OperationsProjectConfigCreateDto,
) {
  const { data } = await http.post<GlobalResponse>(
    "/OperationsProjectConfig/CreateOperationsProjectConfig",
    dto,
  );
  return data;
}


export async function updateOperationsProjectConfig(
  dto: OperationsProjectConfigUpdateDto,
) {
  const { data } = await http.put<GlobalResponse>(
    "/OperationsProjectConfig/UpdateOperationsProjectConfig",
    dto,
  );
  return data;
}
