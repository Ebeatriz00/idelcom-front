

import type { SubTasksResponseDto, SubTasksCreateDto, SubTasksUpdateDto, SubTasksDeleteDto } from "@/application/dtos/subtasks/SubTasks.dto";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchSubTasksList(
  taskToken?: string
): Promise<SubTasksResponseDto[]> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<SubTasksResponseDto[]> | SubTasksResponseDto[]
    >("/SubTasks/ListByTask", {

      params: { businessId: bid, taskToken: taskToken }, 
    });
    return unwrap<SubTasksResponseDto[]>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

export async function fetchSubTaskById(
  linkToken: string
): Promise<SubTasksResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<SubTasksResponseDto> | SubTasksResponseDto
  >("/SubTasks/ById", {
    params: { linkToken: linkToken },
  });

  return unwrap<SubTasksResponseDto>(data);
}

// 3. CREAR
export async function createSubTask(
  dto: Omit<SubTasksCreateDto, "businessId" | "usersBy">
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const userIdNumber = Number(usersBy);

  const { data } = await http.post<GlobalResponse>("/SubTasks/Create", {
    ...dto,
    businessId,
    usersBy: userIdNumber,
  });
  return data;
}

export async function updateSubTask(
  dto: Omit<SubTasksUpdateDto, "businessId" | "usersBy">
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const userIdNumber = Number(usersBy);

  const { data } = await http.put<GlobalResponse>("/SubTasks/Update", {
    ...dto,
    businessId,
    usersBy: userIdNumber,
  });
  return data;
}

export async function deleteSubTask(
  linkToken: string
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  
  if (usersBy == null) throw new Error("Usuario no disponible.");
  
  const userIdNumber = Number(usersBy);

  const payload: SubTasksDeleteDto = {
      linkToken,
      usersBy: userIdNumber
  };

  const { data } = await http.delete<GlobalResponse>("/SubTasks/Delete", {
    data: payload,
  });

  return data;
}