import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import type { 
  ProjectObservationListResponse, 
  UpdateObservationDto,
  UpdateObservationDateDto, 
  ProjectObservationDto
} from "@/application/dtos/observations/Observations.dto";
import { 
  createProjectObservation,
  fetchProjectObservationHiringList,
  fetchProjectObservationList, 
  fetchProjectObservationProjectList, 
  updateProjectObservation,
  updateProjectObservationDate 
} from "@/infrastructure/api-clients/observations/observation.client";

export const qkProjectObservations = {
  all: ["projectObservations"] as const,
  lists: () => [...qkProjectObservations.all, "list"] as const,
  list: (
    page: number,
    pageSize: number,
    search: string,
    projectToken: string
  ) =>
    [
      ...qkProjectObservations.lists(),
      page,
      pageSize,
      search,
      projectToken,
    ] as const,

  projectLists: () => [...qkProjectObservations.all, "contracts"] as const,
  projectList: (
    page: number,
    pageSize: number,
    search: string,
    projectToken: string
  ) =>
    [
      ...qkProjectObservations.projectLists(),
      page,
      pageSize,
      search,
      projectToken,
    ] as const,



    hiringLists: () => [...qkProjectObservations.all, "hiring"] as const,
    hiringList: (
      page: number,
      pageSize: number,
      search: string,
      projectToken: string
    ) =>
      [
        ...qkProjectObservations.hiringLists(),
        page,
        pageSize,
        search,
        projectToken,
      ] as const,
}
export function useProjectObservationList(
  pageIndex: number, 
  pageSize: number, 
  search: string,
  projectToken: string
) {
  const s = (search ?? "").trim();

  return useQuery<ProjectObservationListResponse>({
    queryKey: qkProjectObservations.list(pageIndex, pageSize, s, projectToken),
    queryFn: () => fetchProjectObservationList(s, projectToken),
    placeholderData: (prev) => prev,
    enabled: !!projectToken,
    staleTime: 30_000, 
  });
}

export function useProjectObservationProjectList(
  pageIndex: number, 
  pageSize: number, 
  search: string,
  projectToken: string
) {
  const s = (search ?? "").trim();

  return useQuery<ProjectObservationListResponse>({
    queryKey: qkProjectObservations.projectList(pageIndex, pageSize, s, projectToken),
    queryFn: () => fetchProjectObservationProjectList(s, projectToken),
    placeholderData: (prev) => prev,
    enabled: !!projectToken,
    staleTime: 30_000, 
  });
}


export function useProjectObservationHiringList(
  pageIndex: number, 
  pageSize: number, 
  search: string,
  projectToken: string
) {
  const s = (search ?? "").trim();

  return useQuery<ProjectObservationListResponse>({
    queryKey: qkProjectObservations.hiringList(pageIndex, pageSize, s, projectToken),
    queryFn: () => fetchProjectObservationHiringList(s, projectToken),
    placeholderData: (prev) => prev,
    enabled: !!projectToken,
    staleTime: 30_000, 
  });
}

export function useProjectObservationMutations() {
  const qc = useQueryClient();

  const updateObservationMut = useMutation<
    GlobalResponse,
    unknown,
    UpdateObservationDto
  >({
    mutationFn: updateProjectObservation,
    onMutate: () => showLoading("Actualizando observación..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Observación actualizada correctamente.");
        
        await Promise.all([
            qc.invalidateQueries({ queryKey: qkProjectObservations.lists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.projectLists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.hiringLists() })
        ]);

      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la observación."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al actualizar la observación.");
    },
  });

  const updateObservationDateMut = useMutation<
    GlobalResponse,
    unknown,
    UpdateObservationDateDto
  >({
    mutationFn: updateProjectObservationDate,
    onMutate: () => showLoading("Actualizando fecha..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Fecha actualizada correctamente.");
        
        await Promise.all([
            qc.invalidateQueries({ queryKey: qkProjectObservations.lists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.projectLists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.hiringLists() })
        ]);

      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la fecha."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al actualizar la fecha.");
    },
  });

  const createObservationMut = useMutation<
    GlobalResponse, 
    unknown, 
    Omit<ProjectObservationDto, 'obsId' | 'businessId'> 
  >({
    mutationFn: createProjectObservation,
    onMutate: () => showLoading("Registrando observación..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Observación registrada.");
        
        await Promise.all([
            qc.invalidateQueries({ queryKey: qkProjectObservations.lists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.projectLists() }),
            qc.invalidateQueries({ queryKey: qkProjectObservations.hiringLists() })
        ]);

      } else {
        await showApiError({ response: { data: res } }, "Error al registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error de conexión.");
    },
  });

  return { 
    updateObservationMut,
    updateObservationDateMut,
    createObservationMut 
  };
}