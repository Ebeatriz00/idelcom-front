import {
  createOperationsWorkOrderActivity,
  deleteOperationsWorkOrderActivity,
  fetchOperationsWorkOrderActivityList,
  fetchOperationsWorkOrderActivitySelect,
  updateOperationsWorkOrderActivity,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkWorkOrderActivity } from "./workOrderActivity.qk";
import type {
  OperationsWorkOrderActivityCreateDto,
  OperationsWorkOrderActivityUpdateDto,
} from "@/application";

export function useWorkOrderActivitySelect(
  operationsId: number,
  page: number,
  pageSize: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkWorkOrderActivity.select(operationsId, page, pageSize, search),
    queryFn: () =>
      fetchOperationsWorkOrderActivitySelect(operationsId, page, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled: !!operationsId,
  });
}

export function useWorkOrderActivityList(
  workOrderId: number,
  page: number,
  pageSize: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkWorkOrderActivity.list(workOrderId, page, pageSize, search),
    queryFn: () =>
      fetchOperationsWorkOrderActivityList(workOrderId, page + 1, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled: !!workOrderId,
  });
}

export function useCreateWorkOrderActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderActivityCreateDto) => {
      showLoading("Creando actividad de orden de trabajo...");
      return createOperationsWorkOrderActivity(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderActivity.lists() });
        showSuccess(resp.message || "Actividad creada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateWorkOrderActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderActivityUpdateDto) => {
      showLoading("Actualizando actividad de orden de trabajo...");
      return updateOperationsWorkOrderActivity(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderActivity.lists() });
        showSuccess(resp.message || "Actividad actualizada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteWorkOrderActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: number) => {
      showLoading("Eliminando actividad...");
      return deleteOperationsWorkOrderActivity(activityId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrderActivity.lists() });
        showSuccess(resp.message || "Actividad eliminada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
