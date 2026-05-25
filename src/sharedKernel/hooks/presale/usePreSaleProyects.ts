import type { 
  ActivityOpporCreateDto, 
  ActivityOpporDeleteDto, 
  OptionItem, 
  PagedSelect, 
  Paginated,
} from "@/application";

import type { PreSaleProyectsStatusDto, PreSaleProyectsUpsertDto, ProjectsUpdateStatusDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import type { FileTrackingProjectCreateDto, FileTrackingProjectDeleteDto, PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import type { ProjectTeamResponseDto } from "@/application/dtos/presale/ProjectTeam.dto";

import {
  createActivityOppor,
  createFileTrackingProject,
  createPreSaleProyects,
  createProjectTeam,
  deleteActivityOppor,
  deleteFileTrackingProject,
  deleteProjectTeamMember,
  fetchPreSaleProyectsById,
  fetchPreSaleProyectsDetail,
  fetchPreSaleProyectsList,
  fetchPreSaleProyectsSelect,
  fetchProjectTeamList,
  projectsUpdateState, 
  updateActivityChangePriorityState,
  updateActivityChangeState,
  updatePreSaleProyects,
  updatePreSaleProyectsStatus,
  UpdateResponsibleProject,
  type PreSaleProjectColumnFilters 
} from "@/infrastructure/api-clients/presale/preSaleProyects.client"; 

import type { ProjectCollaboratorBatchDto, } from "@/pages/presale/presaleproyects/components/ProjectCollaboratorForm";
import { usePreSaleProyectsPerms } from "@/pages/presale/presaleproyects/hooks/project.perms";


import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkPreSaleProyects = {
  all: ["preSaleProyects"] as const,
  lists: () => [...qkPreSaleProyects.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string, filters?: PreSaleProjectColumnFilters, usersId? : number, sortBy? : string, sortDirection? : string, opporNum? : string, stateId? : number, category? : number, quoDate? : string) =>
    [...qkPreSaleProyects.lists(), pageIndex, pageSize, search ?? "", usersKey, filters, usersId, sortBy, sortDirection, opporNum, stateId, category, quoDate] as const,

  selects: () => [...qkPreSaleProyects.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPreSaleProyects.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number | string) => [...qkPreSaleProyects.all, "by-id", id] as const,
  detailById: (id: string) => [...qkPreSaleProyects.all, "detail-by-id", id] as const,

  teamList: (page: number, pageSize: number, search: string, projectToken?: string) =>
    [...qkPreSaleProyects.all, "team-list", page, pageSize, search, projectToken] as const,
};
// ---

export function usePreSaleProyectsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPreSaleProyects.select(page, s, pageSize),
    queryFn: () => fetchPreSaleProyectsSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}


export function usePreSaleProyectsDetail(id?: string | null) {
  const enabled = !!id;
  
  return useQuery<PreSaleProyectsDetailDto>({
    queryKey: enabled ? qkPreSaleProyects.detailById(id!) : qkPreSaleProyects.detailById(""),
    queryFn: () => fetchPreSaleProyectsDetail(id!), 
    enabled,
  });
}

export function usePreSaleProyectsList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  filters?: PreSaleProjectColumnFilters, 
  usersId?: number,
  sortBy?: string,
  sortDirection?: string,
  opporNum?: string,
  stateId?: number,
  category?: number,
  quoDate?: string
) {
  const s = (search ?? "").trim();
  const {canViewAllPreSaleProyects, isLoadingPerms} = usePreSaleProyectsPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;
  const usersBy: number | undefined = canViewAllPreSaleProyects
    ? undefined
    : workerId ?? undefined;
  const workerKeyPart: string  = canViewAllPreSaleProyects ? "all" : workerIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllPreSaleProyects || !!workerId);

  return useQuery<Paginated<PreSaleProyectsResponseDto>>({
    queryKey: qkPreSaleProyects.list(pageIndex, pageSize, s, workerKeyPart, filters, usersId, sortBy, sortDirection, opporNum, stateId, category, quoDate),
    queryFn: () => fetchPreSaleProyectsList(pageIndex + 1, pageSize, s, usersBy, filters, usersId, sortBy, sortDirection, opporNum, stateId, category, quoDate),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled
  });
}

export function usePreSaleProyectsById(id?: string | null) {
  return useQuery<PreSaleProyectsResponseDto>({
    queryKey: id != null ? qkPreSaleProyects.byId(id) : qkPreSaleProyects.byId(-1),
    queryFn: () => fetchPreSaleProyectsById(id as string),
    enabled: id != null,
  });
}

export function usePreSaleProyectsMutations() {
  const qc = useQueryClient();

  const updateResponsibleMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; workerId: number; projectCategory: number; }
  >({
    mutationFn: UpdateResponsibleProject,
    onSuccess: async (res) => {
      closeAlert(); 

      if (res.status === 1) {
        await showSuccess("Éxito", res.message);

        await qc.invalidateQueries({ 
            queryKey: qkPreSaleProyects.all
        });
        
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo asignar el responsable."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al asignar responsable.");
    },
  });

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PreSaleProyectsUpsertDto, "linkToken">
  >({
    mutationFn: createPreSaleProyects,
    onMutate: () => showLoading("Registrando nuevo proyecto..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    PreSaleProyectsUpsertDto
  >({
    mutationFn: updatePreSaleProyects,
    onMutate: () => showLoading("Actualizando proyecto..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkPreSaleProyects.lists() }),
          vars.linkToken
            ? qc.invalidateQueries({
                queryKey: qkPreSaleProyects.byId(vars.linkToken),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, PreSaleProyectsStatusDto>({
    mutationFn: updatePreSaleProyectsStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando proyecto..."
          : "Desactivando proyecto..."
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const updateProjectStateMut = useMutation<
    GlobalResponse,
    unknown,
    ProjectsUpdateStatusDto
  >({
    mutationFn: projectsUpdateState,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkPreSaleProyects.all }),
          vars.linkToken
            ? Promise.all([
                qc.invalidateQueries({
                  queryKey: qkPreSaleProyects.byId(vars.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkPreSaleProyects.detailById(vars.linkToken),
                }),
              ])
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el estado del proyecto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando el estado del proyecto.");
    },
  });

  return { 
    createMut, 
    updateMut, 
    statusMut, 
    updateResponsibleMut,
    updateProjectStateMut
  };
}


export function useACProjectMutations() {
  const qc = useQueryClient();
  
  const createACMut = useMutation<
    GlobalResponse,
    unknown,
    ActivityOpporCreateDto
  >({
    mutationFn: createActivityOppor,
    onMutate: () => showLoading("Actividad agregada..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo agregar la actividad."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error agregando actividad.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.projectToken) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
        });
        await qc.refetchQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkPreSaleProyects.all });
    },
  });

  const delelteACMut = useMutation<
    GlobalResponse,
    unknown,
    ActivityOpporDeleteDto
  >({
    mutationFn: deleteActivityOppor,
    onMutate: () => showLoading("Actividad eliminada..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la Actividad."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando Actividad.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.projectToken) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
        });
        await qc.refetchQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkPreSaleProyects.all });
    },
  });

  const ActivitystateChangeMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; projectToken: string }
  >({
    mutationFn: updateActivityChangeState,
    onMutate: () => showLoading("Ha cambiado de estado..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.projectToken) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
        });
        await qc.refetchQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkPreSaleProyects.all });
    },
  });

  const ActivitystateChangePriorityMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; projectToken: string }
  >({
    mutationFn: updateActivityChangePriorityState,
    onMutate: () => showLoading("Ha cambiado de estado..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.projectToken) {
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
        });
        await qc.refetchQueries({
          queryKey: qkPreSaleProyects.detailById(vars.projectToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkPreSaleProyects.all });
    },
  });

  return {
    createACMut,
    delelteACMut,
    ActivitystateChangeMut,
    ActivitystateChangePriorityMut,
  };
}

export function useFTProjectMutations() {
  const qc = useQueryClient();

  const invalidateDetail = async (projectToken?: string) => {
    const promises = [qc.invalidateQueries({ queryKey: qkPreSaleProyects.all })];
    
    if (projectToken) {
      promises.push(
        qc.invalidateQueries({ 
            queryKey: qkPreSaleProyects.detailById(projectToken) 
        })
      );
    }
    
    await Promise.all(promises);
  };

  const createFTMut = useMutation<
    GlobalResponse,
    unknown,
    FileTrackingProjectCreateDto
  >({
    mutationFn: createFileTrackingProject,
    onMutate: () => showLoading("Archivo agregado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateDetail(vars.projectToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo agregar el archivo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error agregando archivo.");
    },
  });

  const delelteFTMut = useMutation<
    GlobalResponse,
    unknown,
    FileTrackingProjectDeleteDto
  >({
    mutationFn: deleteFileTrackingProject,
    onMutate: () => showLoading("Archivo eliminado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateDetail(vars.projectToken);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar el archivo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando archivo.");
    },
  });

  return { createFTMut, delelteFTMut };
}

export function useProjectTeamMutations() {
  const qc = useQueryClient();


  const createCollaboratorMut = useMutation<
    GlobalResponse,
    unknown,
    ProjectCollaboratorBatchDto 
  >({
    mutationFn: createProjectTeam, 
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Colaborador asignado.");

        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.lists(),
        });
        await qc.invalidateQueries({
            queryKey: [...qkPreSaleProyects.all, "team-list"] 
        });
        
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo asignar el colaborador."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al asignar colaborador.");
    },
  });

  const deleteCollaboratorMut = useMutation({
    mutationFn: deleteProjectTeamMember,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Eliminado", "Colaborador eliminado del equipo.");
        
        await qc.invalidateQueries({
             queryKey: [...qkPreSaleProyects.all, "team-list"] 
        });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo eliminar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al eliminar.");
    },
  });

  return { createCollaboratorMut, deleteCollaboratorMut };
}

export function useProjectTeamList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  projectToken?: string
) {
  const s = (search ?? "").trim();
  
  return useQuery<Paginated<ProjectTeamResponseDto>>({
    queryKey: qkPreSaleProyects.teamList(pageIndex, pageSize, s, projectToken),
    queryFn: () => fetchProjectTeamList(pageIndex + 1, pageSize, s, projectToken),
    placeholderData: (prev) => prev, 
  });
}