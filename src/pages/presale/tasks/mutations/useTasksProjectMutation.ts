import type { TasksProjectUpsertDto, TasksProjectStatusDto, TaskProjectDeleteDto } from "@/application";
import { 
  createTasksProject, 
  updateTasksProject, 
  deleteTaskProject, 
  updateTasksProjectStatus,
  updateTasksProjectCompleted,
  updateTasksProjectChangeState,
  updateTaskProjectChangePriorityState
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";

// Importamos AMBAS keys para poder invalidarlas cruzadas
import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects";
import { qkTasksProject } from "@/sharedKernel/hooks/presale/useTasksProject";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTasksProjectMutations = () => {
  const qc = useQueryClient();

  // --- FUNCIÓN MAESTRA DE RECARGA ---
  // Invalida todo lo relacionado a tareas y proyectos para asegurar consistencia
  const refreshGlobal = async () => {
    // 1. Refresca listas, tablas y detalles de TAREAS
    await qc.invalidateQueries({ queryKey: qkTasksProject.all });
    
    // 2. Refresca detalles de PROYECTOS (donde se ven las tareas incrustadas)
    await qc.invalidateQueries({ queryKey: qkPreSaleProyects.all });
  };

  // --- CREAR ---
  const createMut = useMutation<GlobalResponse, unknown, Omit<TasksProjectUpsertDto, "tasksId">>({
    mutationFn: createTasksProject,
    onMutate: () => showLoading("Registrando tarea..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal(); 
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error registrando."); },
  });

  // --- EDITAR ---
  const updateMut = useMutation<GlobalResponse, unknown, TasksProjectUpsertDto>({
    mutationFn: updateTasksProject,
    onMutate: () => showLoading("Actualizando tarea..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        // Aquí estaba el error antes: ya no dependemos de 'vars.projectToken'
        await refreshGlobal();
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error actualizando."); },
  });

  // --- ELIMINAR (Usada en PreSaleProyectsDetail) ---
  const deleteMut = useMutation<GlobalResponse, unknown, TaskProjectDeleteDto>({
    mutationFn: deleteTaskProject,
    onMutate: () => showLoading("Eliminando tarea..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal();
      } else {
        await showApiError({ response: { data: res } }, "No se pudo eliminar.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error eliminando."); },
  });

  // --- CAMBIAR ESTADO (Activo/Inactivo - Usada en Tabla) ---
  const statusMut = useMutation<GlobalResponse, unknown, TasksProjectStatusDto>({
    mutationFn: updateTasksProjectStatus,
    onMutate: () => showLoading("Cambiando estado..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await refreshGlobal();
      } else {
        await showApiError({ response: { data: res } }, "Error al cambiar estado.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error de estado."); },
  });

  // --- MARCAR COMPLETADO (Checkbox) ---
  const statusCompletedMut = useMutation<GlobalResponse, unknown, { linkToken: string; projectId: string }>({
    mutationFn: updateTasksProjectCompleted,
    onMutate: () => showLoading("Actualizando..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) await showSuccess("Éxito", res.message);
      else await showApiError({ response: { data: res } }, "Error.");
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
    onSettled: async () => await refreshGlobal()
  });

  // --- CAMBIAR ESTADO PICKER (Pendiente, Proceso, etc) ---
  const statusChangeMut = useMutation<GlobalResponse, unknown, { linkToken: string; status: string; projectId: string }>({
    mutationFn: updateTasksProjectChangeState,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) await showSuccess("Éxito", res.message);
      else await showApiError({ response: { data: res } }, "Error.");
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
    onSettled: async () => await refreshGlobal()
  });

  // --- CAMBIAR PRIORIDAD PICKER ---
  const statusChangePriorityMut = useMutation<GlobalResponse, unknown, { linkToken: string; status: string; projectId: string }>({
    mutationFn: updateTaskProjectChangePriorityState,
    onMutate: () => showLoading("Actualizando prioridad..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) await showSuccess("Éxito", res.message);
      else await showApiError({ response: { data: res } }, "Error.");
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
    onSettled: async () => await refreshGlobal()
  });

  // Retornamos TODAS las mutaciones que tus componentes esperan
  return { 
    createMut, 
    updateMut, 
    deleteMut, 
    statusMut, 
    statusCompletedMut, 
    statusChangeMut, 
    statusChangePriorityMut 
  };
};