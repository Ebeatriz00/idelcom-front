
import {
  fetchTasksProjectSelect,
  fetchTasksProjectList,
  fetchTasksProjectById,
  createTasksProject,
  updateTasksProject,
  deleteTaskProject,
  updateTasksProjectStatus,
  updateTasksProjectCompleted,
  updateTasksProjectChangeState,
  updateTaskProjectChangePriorityState,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,

} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects";
import type { 
PagedSelect,
OptionItem,
Paginated,
TasksProjectResponseDto,
TasksProjectUpsertDto,
TaskProjectDeleteDto,
TasksProjectStatusDto
} from "@/application";

export const qkTasksProject = {
  all: ["tasksproject"] as const,
  lists: () => [...qkTasksProject.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string, opporToken?: string) =>
    [...qkTasksProject.lists(), pageIndex, pageSize, search ?? "", opporToken ?? "all"] as const,
  selects: () => [...qkTasksProject.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTasksProject.selects(), page, search ?? "", pageSize] as const,
  byId: (id: number) => [...qkTasksProject.all, "by-id", id] as const,
};


export function useTasksProjectOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTasksProject.select(page, s, pageSize),
    queryFn: () => fetchTasksProjectSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useTasksProjectList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  opporToken?: string
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<TasksProjectResponseDto>>({
    queryKey: qkTasksProject.list(pageIndex, pageSize, s, opporToken),
    queryFn: () => fetchTasksProjectList(pageIndex + 1, pageSize, s, opporToken),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useTasksProjectById(id?: number | null) {
  return useQuery<TasksProjectResponseDto>({
    queryKey: id != null ? qkTasksProject.byId(id) : qkTasksProject.byId(-1),
    queryFn: () => fetchTasksProjectById(id as number),
    enabled: id != null,
  });
}


export function useTasksProjectMutations() {
  const qc = useQueryClient();
  const invalidateContext = async (projectToken?: string | null) => {
    const promises = [
      qc.invalidateQueries({ queryKey: qkTasksProject.all })
    ];
    promises.push(
       qc.invalidateQueries({ queryKey: qkPreSaleProyects.all })
    );
    if (projectToken) {
      promises.push(
        qc.invalidateQueries({ 
            queryKey: qkPreSaleProyects.detailById(projectToken) 
        })
      );
    }

    await Promise.all(promises);
  };

  const createMut = useMutation<GlobalResponse, unknown, Omit<TasksProjectUpsertDto, "tasksId">>({
    mutationFn: createTasksProject,
    onMutate: () => showLoading("Registrando nueva tarea..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateContext(vars.opporToken);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, TasksProjectUpsertDto>({
    mutationFn: updateTasksProject,
    onMutate: () => showLoading("Actualizando tarea..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateContext(vars.projectToken);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const deleteMut = useMutation<GlobalResponse, unknown, TaskProjectDeleteDto>({
    mutationFn: deleteTaskProject,
    onMutate: () => showLoading("Eliminando actividad..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateContext(vars.projectToken);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo eliminar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, TasksProjectStatusDto>({
    mutationFn: updateTasksProjectStatus,
    onMutate: (vars) => showLoading(vars.status === "1" ? "Activando..." : "Desactivando..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
         await showSuccess("Éxito", res.message);
         await invalidateContext(); 
      } else {
         await showApiError({ response: { data: res } }, "Error de estado.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar estado.");
    },
  });
  
  const statusCompletedMut = useMutation<GlobalResponse, unknown, { linkToken: string; projectId: string }>({
    mutationFn: updateTasksProjectCompleted,
    onMutate: () => showLoading("Cambiando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
         await showSuccess("Éxito", res.message);
         await invalidateContext(vars.projectId);
      } else {
         await showApiError({ response: { data: res } }, "Error.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
  });

  const statusChangeMut = useMutation<GlobalResponse, unknown, { linkToken: string; status: string, projectId: string }>({
    mutationFn: updateTasksProjectChangeState,
    onMutate: () => showLoading("Cambiando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
         await showSuccess("Éxito", res.message);
         await invalidateContext(vars.projectId);
      } else {
         await showApiError({ response: { data: res } }, "Error.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
  });

  const statusChangePriorityMut = useMutation<GlobalResponse, unknown, { linkToken: string; status: string, projectId: string }>({
    mutationFn: updateTaskProjectChangePriorityState,
    onMutate: () => showLoading("Cambiando prioridad..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
         await showSuccess("Éxito", res.message);
         await invalidateContext(vars.projectId);
      } else {
         await showApiError({ response: { data: res } }, "Error.");
      }
    },
    onError: async (e) => { closeAlert(); await showApiError(e, "Error."); },
  });

  return { 
    createMut, 
    updateMut, 
    statusMut, 
    statusCompletedMut, 
    statusChangeMut, 
    statusChangePriorityMut, 
    deleteMut 
  };
}