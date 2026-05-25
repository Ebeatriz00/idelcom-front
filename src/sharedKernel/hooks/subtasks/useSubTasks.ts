
import type { SubTasksResponseDto, SubTasksCreateDto, SubTasksUpdateDto } from "@/application/dtos/subtasks/SubTasks.dto";
import { fetchSubTasksList, fetchSubTaskById, createSubTask, updateSubTask, deleteSubTask } from "@/infrastructure/api-clients/subtask/subTask.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkSubTasks = {
  all: ["subtasks"] as const,
  lists: () => [...qkSubTasks.all, "list"] as const,
  list: (taskToken?: string) =>
    [...qkSubTasks.lists(), taskToken ?? "all"] as const,
  byId: (linkToken: string) => [...qkSubTasks.all, "by-id", linkToken] as const,
};

export function useSubTasksList(taskToken?: string) {
  return useQuery<SubTasksResponseDto[]>({
    queryKey: qkSubTasks.list(taskToken),
    queryFn: () => fetchSubTasksList(taskToken),
    staleTime: 60_000, 
  });
}

export function useSubTaskById(linkToken?: string | null) {
  return useQuery<SubTasksResponseDto>({
    queryKey: linkToken ? qkSubTasks.byId(linkToken) : qkSubTasks.byId(""),
    queryFn: () => fetchSubTaskById(linkToken as string),
    enabled: !!linkToken,
  });
}

const isSuccessResponse = (res: any): boolean => {
  if (res === true) return true;

  if (!res) return false;

  if (res.status == 1) return true;
  if (res.success === true) return true;

  if (res.data && (res.data.status == 1 || res.data.success === true)) return true;

  return false;
};

const getMessage = (res: any, defaultMsg: string) => {
  if (typeof res === 'string') return res;
  return res?.message || res?.data?.message || defaultMsg;
};

export function useSubTasksMutations() {
  const qc = useQueryClient();

  const invalidateAllSubTasks = async () => {
    await qc.invalidateQueries({ queryKey: qkSubTasks.all });
  };

  const createMut = useMutation<any, unknown, Omit<SubTasksCreateDto, "businessId" | "usersBy">>({
    mutationFn: createSubTask,
    onMutate: () => showLoading("Registrando..."),
    onSuccess: async (res) => {
      closeAlert();
      if (isSuccessResponse(res)) {
        await showSuccess("Éxito", getMessage(res, "Sub-tarea creada correctamente"));
        await invalidateAllSubTasks();
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al crear.");
    },
  });

  const updateMut = useMutation<any, unknown, Partial<SubTasksUpdateDto>>({
    mutationFn: updateSubTask as any,
    onMutate: () => showLoading("Actualizando..."),
    onSuccess: async (res) => {
      closeAlert();
      if (isSuccessResponse(res)) {
        await showSuccess("Éxito", getMessage(res, "Actualizado correctamente"));
        await invalidateAllSubTasks();
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const deleteMut = useMutation<any, unknown, string>({
    mutationFn: deleteSubTask,
    onMutate: () => showLoading("Eliminando..."),
    onSuccess: async (res) => {
      closeAlert();
      if (isSuccessResponse(res)) {
        await showSuccess("Éxito", getMessage(res, "Eliminado correctamente"));
        await invalidateAllSubTasks();
      } else {
        await showApiError({ response: { data: res } }, "No se pudo eliminar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando.");
    },
  });

  return { createMut, updateMut, deleteMut };
}