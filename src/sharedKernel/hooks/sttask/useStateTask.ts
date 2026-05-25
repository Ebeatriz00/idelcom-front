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
import {
  createStateTask,
  fetchStateTaskById,
  fetchStateTaskList,
  fetchStateTaskSelect,
  fetchStateTaskSelectOp,
  updateStateTask,
  updateStateTaskStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkStateTask = {
  all: ["states-task"] as const,
  lists: () => [...qkStateTask.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string, projectId?: number) =>
    [...qkStateTask.lists(), pageIndex, pageSize, search ?? "", projectId ?? "ALL"] as const,

  selects: () => [...qkStateTask.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkStateTask.selects(), page, search ?? "", pageSize] as const,

  selectsOp: () => [...qkStateTask.all, "select-option"] as const,
  selectOp: () => [...qkStateTask.selects()] as const,

  byId: (id: number) => [...qkStateTask.all, "by-id", id] as const,
};

export function useStateTaskList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  projectId?: number
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<StateTaskResponseDto>>({
    queryKey: qkStateTask.list(pageIndex, pageSize, s, projectId),
    queryFn: () => fetchStateTaskList(pageIndex + 1, pageSize, s, projectId),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useStateTaskOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkStateTask.select(page, s, pageSize),
    queryFn: () => fetchStateTaskSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useStateTasks() {
  return useQuery<StateTaskSelectDto[]>({
    queryKey: qkStateTask.selectOp(),
    queryFn: fetchStateTaskSelectOp,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
export function useStateTaskById(id?: number | null) {
  return useQuery<StateTaskByIdDto>({
    queryKey: id != null ? qkStateTask.byId(id) : qkStateTask.byId(-1),
    queryFn: () => fetchStateTaskById(id as number),
    enabled: id != null,
  });
}

export function useStateTaskMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<StateTaskUpsertDto, "stateTaskId">
  >({
    mutationFn: createStateTask,
    onMutate: () => showLoading("Creando estado de tareas..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkStateTask.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el estado de tareas."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando estado de tareas.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, StateTaskUpsertDto>({
    mutationFn: updateStateTask,
    onMutate: () => showLoading("Actualizando estado de tareas..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkStateTask.lists() }),
          vars.stateTaskId
            ? qc.invalidateQueries({
                queryKey: qkStateTask.byId(vars.stateTaskId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el estado de tareas."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando estado de tareas.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, StateTaskStatusDto>({
    mutationFn: updateStateTaskStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkStateTask.lists(),
            refetchType: "active",
          }),
          vars.stateTaskId
            ? qc.invalidateQueries({
                queryKey: qkStateTask.byId(vars.stateTaskId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}
