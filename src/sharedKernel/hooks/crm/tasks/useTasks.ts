import type {
  OptionItem,
  PagedSelect,
  Paginated,
  TaskOpporDeleteDto,
  TasksResponseDto,
  TasksStatusDto,
  TasksUpsertDto,
} from "@/application";
import { CacheController } from "@/cache/cacheController";
import {
  createTasks,
  deleteTaskOppor,
  fetchTasksById,
  fetchTasksList,
  fetchTasksSelect,
  updateTaskChangePriorityState,
  updateTasks,
  updateTasksChangeState,
  updateTasksCompleted,
  updateTasksStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkOpportunities } from "../opportunity/opportunities.qk";
import { qkTasks } from "./tasks.qk";

// --- QUERY KEYS ---

// --- HOOKS DE LECTURA ---

export function useTasksOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTasks.select(page, s, pageSize),
    queryFn: () => fetchTasksSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useTasksList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<TasksResponseDto>>({
    queryKey: qkTasks.list(pageIndex, pageSize, s),
    queryFn: () => fetchTasksList(pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useTasksById(id?: string | null) {
  return useQuery<TasksResponseDto>({
    queryKey: id != null ? qkTasks.byId(id) : qkTasks.byId(""),
    queryFn: () => fetchTasksById(id as string),
    enabled: id != null,
  });
}

export function useTasksMutations() {
  const qc = useQueryClient();

  const refreshGlobal = async (opporToken?: string | null) => {
    await CacheController.invalidate("preSales", "opportunities", "task");

    if (opporToken) {
      await qc.invalidateQueries({
        queryKey: [...qkOpportunities.all, "detail-by-id", opporToken],
        exact: false,
      });
      await qc.refetchQueries({
        queryKey: [...qkOpportunities.all, "detail-by-id", opporToken],
        type: "active",
      });
    }
  };

  const createMut = useMutation<GlobalResponse, unknown, TasksUpsertDto>({
    mutationFn: createTasks,
    onMutate: () => showLoading("Registrando nueva tarea..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, TasksUpsertDto>({
    mutationFn: updateTasks,
    onMutate: () => showLoading("Actualizando tarea..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        // AQUÍ FALTABA REFRESCAR LA OPORTUNIDAD
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tarea.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tarea.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, TasksStatusDto>({
    mutationFn: updateTasksStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1" ? "Activando tarea..." : "Desactivando tarea...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        // AQUÍ TAMBIÉN FALTABA
        await refreshGlobal();
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const statusCompletedMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; opporToken: string }
  >({
    mutationFn: updateTasksCompleted,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const statusChangeMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; opporToken: string }
  >({
    mutationFn: updateTasksChangeState,
    onMutate: () => showLoading("Ha cambiado de estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const statusChangePriorityMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; opporToken: string }
  >({
    mutationFn: updateTaskChangePriorityState,
    onMutate: () => showLoading("Ha cambiado de estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const deleteMut = useMutation<GlobalResponse, unknown, TaskOpporDeleteDto>({
    mutationFn: deleteTaskOppor,
    onMutate: () => showLoading("Actividad eliminada..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la Actividad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando Actividad.");
    },
  });

  return {
    createMut,
    updateMut,
    statusMut,
    statusCompletedMut,
    statusChangeMut,
    statusChangePriorityMut,
    deleteMut,
  };
}
