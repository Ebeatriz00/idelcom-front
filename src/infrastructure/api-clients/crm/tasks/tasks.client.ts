import type {
  OptionItem,
  PagedSelect,
  Paginated,
  TaskChangePriorityStateDto,
  TaskOpporDeleteDto,
  TasksChangeStateDto,
  TasksCompletedDto,
  TasksResponseDto,
  TasksStatusDto,
  TasksUpsertDto,
} from "@/application";
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

export async function fetchTasksList(
  page: number,
  pageSize: number,
  search: string
): Promise<Paginated<TasksResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<TasksResponseDto>> | Paginated<TasksResponseDto>
    >("/Tasks/TasksList", {
      params: { business_id: bid, search, page, pageSize },
    });
    return unwrap<Paginated<TasksResponseDto>>(data);
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

export async function fetchTasksSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Tasks/TasksSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchTasksById(
  linkToken: string
): Promise<TasksResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<TasksResponseDto> | TasksResponseDto
  >("/Tasks/TasksById", {
    params: { linkToken }, 
  });

  return unwrap<TasksResponseDto>(data);
}

type TasksCreateDto = Omit<TasksUpsertDto, "linkToken">;

export async function createTasks(
  dto: TasksCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Tasks/TasksCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateTasks(
  dto: TasksUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Tasks/TasksUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateTasksStatus(
  dto: TasksStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Tasks/TasksStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateTasksCompleted(
  dto: TasksCompletedDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Tasks/TasksStateCompleted",
    { ...dto, businessId, usersBy }
  );
  return data;
}
export async function updateTasksChangeState(
  dto: TasksChangeStateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Tasks/TasksStateChange", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
export async function updateTaskChangePriorityState(
  dto: TaskChangePriorityStateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Tasks/TasksPriorityStateChange",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function deleteTaskOppor(
  dto: TaskOpporDeleteDto
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Tasks/TasksOpporDelete",
    {
      data: dto,
    }
  );

  return data;
}