import type {
  OperationsProjectConfigCreateDto,
  OperationsProjectConfigResponseDto,
  OperationsProjectConfigUpdateDto,
} from "@/application/dtos/operations/configProject/configProject.dto";
import {
  createOperationsProjectConfig,
  fetchAllOperationsProjectConfigs,
  updateOperationsProjectConfig,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkConfigProject = {
  all: ["config-project"] as const,
  details: () => [...qkConfigProject.all, "detail"] as const,
  detail: (id: number) => [...qkConfigProject.details(), id] as const,
};

/**
 * Hook para obtener la configuración de un proyecto.
 */
export function useConfigProjectById(operationsId: number) {
  return useQuery<OperationsProjectConfigResponseDto[]>({
    queryKey: qkConfigProject.detail(operationsId),
    queryFn: async () => {
      const data = await fetchAllOperationsProjectConfigs(operationsId);
      return data || [];
    },
    enabled: operationsId > 0,
    staleTime: 60_000,
  });
}

/**
 * Hook para las mutaciones de configuración de proyecto.
 */
export function useConfigProjectMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<any, unknown, OperationsProjectConfigCreateDto>({
    mutationFn: createOperationsProjectConfig,
    onMutate: () => showLoading("Creando configuración..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkConfigProject.all });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo crear la configuración.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al crear configuración.");
    },
  });

  const updateMut = useMutation<any, unknown, OperationsProjectConfigUpdateDto>({
    mutationFn: updateOperationsProjectConfig,
    onMutate: () => showLoading("Actualizando configuración..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkConfigProject.all });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar la configuración.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al actualizar configuración.");
    },
  });

  return { createMut, updateMut };
}
