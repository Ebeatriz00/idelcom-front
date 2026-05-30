import {
  createOperationsSupervisor,
  deleteOperationsSupervisor,
  fetchOperationsSupervisorById,
  fetchOperationsSupervisorList,
  updateOperationsSupervisor,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSupervisor } from "./supervisor.qk";
import type {
  OperationsSupervisorCreateDto,
  OperationsSupervisorUpdateDto,
} from "@/application";

export function useSupervisorList(
  page: number,
  pageSize: number,
  search: string = ""
) {
  return useQuery({
    queryKey: qkSupervisor.list(page, pageSize, search),
    queryFn: () => fetchOperationsSupervisorList(page + 1, pageSize, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSupervisorById(supervisorId?: number) {
  return useQuery({
    queryKey: qkSupervisor.detail(supervisorId ?? 0),
    queryFn: () => fetchOperationsSupervisorById(supervisorId!),
    enabled: !!supervisorId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsSupervisorCreateDto) => {
      showLoading("Creando supervisor...");
      return createOperationsSupervisor(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupervisor.lists() });
        showSuccess(resp.message || "Supervisor creado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsSupervisorUpdateDto) => {
      showLoading("Actualizando supervisor...");
      return updateOperationsSupervisor(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupervisor.all });
        showSuccess(resp.message || "Supervisor actualizado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supervisorId: number) => {
      showLoading("Eliminando supervisor...");
      return deleteOperationsSupervisor(supervisorId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupervisor.all });
        showSuccess(resp.message || "Supervisor eliminado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
