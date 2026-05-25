import type {
  OptionItem,
  PagedSelect,
  Paginated,
  TaskProjectDeleteDto,
  TasksProjectChangePriorityStateDto,
  TasksProjectChangeStateDto,
  TasksProjectCompletedDto,
  TasksProjectResponseDto,
  TasksProjectStatusDto,
  TasksProjectUpsertDto,
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

export async function fetchTasksProjectList(
  page: number,
  pageSize: number,
  search: string,
  opporToken?: string
): Promise<Paginated<TasksProjectResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<TasksProjectResponseDto>>
      | Paginated<TasksProjectResponseDto>
    >("/Tasks/TasksProjectList", {
      params: { business_id: bid, search, page, pageSize, opporToken: opporToken },
    });
    return unwrap<Paginated<TasksProjectResponseDto>>(data);
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

export async function fetchTasksProjectSelect(
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

export async function fetchTasksProjectById(
  tasksId: number
): Promise<TasksProjectResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<TasksProjectResponseDto> | TasksProjectResponseDto
  >("/Tasks/TasksById", {
    params: { tasksId: tasksId },
  });

  return unwrap<TasksProjectResponseDto>(data);
}

type TasksProjectCreateDto = Omit<TasksProjectUpsertDto, "tasksId">;
export async function createTasksProject(
  dto: TasksProjectCreateDto
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

export async function updateTasksProject(
  dto: TasksProjectUpsertDto
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

export async function updateTasksProjectStatus(
  dto: TasksProjectStatusDto
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

export async function updateTasksProjectCompleted(
  dto: TasksProjectCompletedDto
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

export async function updateTasksProjectChangeState(
  dto: TasksProjectChangeStateDto
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

export async function updateTaskProjectChangePriorityState(
  dto: TasksProjectChangePriorityStateDto
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


export async function deleteTaskProject(
  dto: TaskProjectDeleteDto
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Tasks/TasksProjectDelete",
    {
      data: dto,
    }
  );

  return data;
}