import {
  createOperationsWorkOrderResponsible,
  deleteOperationsWorkOrderResponsible,
  fetchOperationsWorkOrderResponsibleById,
  fetchOperationsWorkOrderResponsibleList,
  updateOperationsWorkOrderResponsible,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkWorkOrderResponsible } from "./workOrderResponsible.qk";
import type {
  OperationsWorkOrderResponsibleCreateDto,
  OperationsWorkOrderResponsibleUpdateDto,
} from "@/application";

export function useWorkOrderResponsibleList(
  pageIndex: number,
  pageSize: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkWorkOrderResponsible.list(pageIndex, pageSize, search),
    queryFn: () =>
      fetchOperationsWorkOrderResponsibleList(pageIndex, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useWorkOrderResponsibleById(workOrderResponsibleId?: number) {
  return useQuery({
    queryKey: qkWorkOrderResponsible.detail(workOrderResponsibleId ?? 0),
    queryFn: () => fetchOperationsWorkOrderResponsibleById(workOrderResponsibleId!),
    enabled: !!workOrderResponsibleId,
    staleTime: 60_000,
  });
}

export function useCreateWorkOrderResponsible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderResponsibleCreateDto) => {
      showLoading("Asignando responsable...");
      return createOperationsWorkOrderResponsible(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderResponsible.lists() });
        showSuccess(resp.message || "Responsable asignado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateWorkOrderResponsible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderResponsibleUpdateDto) => {
      showLoading("Actualizando responsable...");
      return updateOperationsWorkOrderResponsible(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderResponsible.all });
        showSuccess(resp.message || "Responsable actualizado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteWorkOrderResponsible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workOrderResponsibleId: number) => {
      showLoading("Eliminando responsable...");
      return deleteOperationsWorkOrderResponsible(workOrderResponsibleId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderResponsible.all });
        showSuccess(resp.message || "Responsable eliminado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
