import type {
  ActiveSsomaAssignmentDto,
  OperationsTeamSsomaCreateDto,
  OperationsTeamSsomaGetByIdDto,
  OperationsTeamSsomaListItemDto,
  OperationsTeamSsomaUpdateDto,
  ProcessSsomaAssignmentChangeDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchOperationsTeamSsomaById(
  operationsTeamSsomaId: number
): Promise<OperationsTeamSsomaGetByIdDto> {
  const { data } = await http.get<OperationsTeamSsomaGetByIdDto>(
    "/OperationsTeamSsoma/GetByIdTeamSsoma",
    {
      params: { operationsTeamSsomaId },
    }
  );
  return data;
}

export async function fetchOperationsTeamSsomaListByProcessId(
  ssomaProcessId: number
): Promise<OperationsTeamSsomaListItemDto[]> {
  const { data } = await http.get<OperationsTeamSsomaListItemDto[]>(
    "/OperationsTeamSsoma/GetListProcessId",
    {
      params: { ssomaProcessId },
    }
  );
  return data;
}

export async function fetchActiveSsomaAssignmentByWorkerId(
  workerId: number
): Promise<ActiveSsomaAssignmentDto> {
  const { data } = await http.get<ActiveSsomaAssignmentDto>(
    "/OperationsTeamSsoma/GetActiveAssignmentByWorkerId",
    {
      params: { workerId },
    }
  );
  return data;
}

export async function createOperationsTeamSsoma(
  dto: OperationsTeamSsomaCreateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.post<GlobalResponse>(
    "/OperationsTeamSsoma/CreateTeamSsoma",
    {
      ...dto,
      BusinessId: Number(businessId),
      CreateUser: Number(userId),
    }
  );
  return data;
}

export async function updateOperationsTeamSsoma(
  dto: OperationsTeamSsomaUpdateDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.put<GlobalResponse>(
    "/OperationsTeamSsoma/UpdateTeamSsoma",
    {
      ...dto,
      BusinessId: Number(businessId),
      UpdateUser: Number(userId),
    }
  );
  return data;
}

export async function processSsomaAssignmentUpdate(
  dto: ProcessSsomaAssignmentChangeDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.post<GlobalResponse>(
    "/OperationsTeamSsoma/ProcessAssignmentUpdate",
    {
      ...dto,
      BusinessId: Number(businessId),
      UpdateUser: Number(userId),
    }
  );
  return data;
}

export async function processSsomaAssignmentRelocation(
  dto: ProcessSsomaAssignmentChangeDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.post<GlobalResponse>(
    "/OperationsTeamSsoma/ProcessAssignmentRelocation",
    {
      ...dto,
      BusinessId: Number(businessId),
      UpdateUser: Number(userId),
    }
  );
  return data;
}

export async function processSsomaAssignmentReplacement(
  dto: ProcessSsomaAssignmentChangeDto
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  const userId = getUserIdFromtStorage();

  const { data } = await http.post<GlobalResponse>(
    "/OperationsTeamSsoma/ProcessAssignmentReplacement",
    {
      ...dto,
      BusinessId: Number(businessId),
      UpdateUser: Number(userId),
    }
  );
  return data;
}

export async function deleteOperationsTeamSsoma(
  operationsTeamSsomaId: number
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/OperationsTeamSsoma/DeleteTeamSsoma",
    {
      params: { operationsTeamSsomaId },
    }
  );
  return data;
}
