import type {
  OptionItem,
  PagedSelect,
  Paginated,
  StateTaskByIdDto,
  StateTaskResponseDto,
  StateTaskSelectDto,
  StateTaskStatusDto,
  StateTaskUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchStateTaskList(
  page: number,
  pageSize: number,
  search: string,
  projectId?: number
): Promise<Paginated<StateTaskResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<StateTaskResponseDto>>
      | Paginated<StateTaskResponseDto>
    >("/StateTask/StateTaskList", {
      params: { businessId: bid, search, page, pageSize, projectId },
    });
    return unwrap<Paginated<StateTaskResponseDto>>(data);
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

export async function fetchStateTaskSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/StateTask/StateTaskSelect", {
    params: { businessId: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchStateTaskSelectOp(): Promise<StateTaskSelectDto[]> {
  const bid = getBusinessIdFromStorage();

  if (!bid) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<StateTaskSelectDto[]> | StateTaskSelectDto[]
  >("/StateTask/StateTaskSelectNo", {
    params: { businessId: bid },
  });

  return unwrap<StateTaskSelectDto[]>(data);
}

export async function fetchStateTaskById(
  stateTaskId: number
): Promise<StateTaskByIdDto> {
  const { data } = await http.get<
    ApiEnvelope<StateTaskByIdDto> | StateTaskByIdDto
  >("/StateTask/StateTaskById", {
    params: { stateTaskId: stateTaskId },
  });

  return unwrap<StateTaskByIdDto>(data);
}

type StateTaskCreateDto = Omit<StateTaskUpsertDto, "stateTaskId">;
export async function createStateTask(
  dto: StateTaskCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/StateTask/StateTaskCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateStateTask(
  dto: StateTaskUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/StateTask/StateTaskUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateStateTaskStatus(
  dto: StateTaskStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/StateTask/StateTaskStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
