import type {
  TaskOpporDeleteDto,
  TasksStatusDto,
  TasksUpsertDto,
} from "@/application";
import { CacheController } from "@/cache/cacheController";
import {
  createTasks,
  deleteTaskOppor, // Tu función correcta
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
import { qkOpportunities } from "@/sharedKernel/hooks/crm/opportunity/opportunities.qk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTasksMutations() {
  const qc = useQueryClient();
  const refreshGlobal = async (opporToken?: string | null) => {
    await CacheController.invalidate("opportunities", "task");

    if (opporToken) {
      await qc.invalidateQueries({
        queryKey: qkOpportunities.detailById(opporToken),
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
        // Pasamos el opporToken si existe para refrescar el detalle padre
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

        // AQUÍ ESTABA EL ERROR: Antes solo invalidaba qkTasks.
        // Ahora invalidamos todo, pasando el opporToken si viene en el DTO
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
        await refreshGlobal(); // Refrescar todo al cambiar estado activo/inactivo
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
    onMutate: () => showLoading("Actualizando estado..."),
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
    onMutate: () => showLoading("Actualizando estado..."),
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
    onMutate: () => showLoading("Actualizando prioridad..."),
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
    onMutate: () => showLoading("Eliminando tarea..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(vars.opporToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la Tarea.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando Tarea.");
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
