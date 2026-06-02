import {
  createOperationsWorkOrder,
  deleteOperationsWorkOrder,
  fetchOperationsWorkOrderById,
  fetchOperationsWorkOrderList,
  fetchOperationsWorkOrderSelect,
  updateOperationsWorkOrder,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkWorkOrder } from "./workOrder.qk";
import type {
  OperationsWorkOrderCreateDto,
  OperationsWorkOrderUpdateDto,
} from "@/application";

export function useWorkOrderList(
  page: number,
  pageSize: number,
  operationsId?: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkWorkOrder.list(page, pageSize, operationsId ?? 0, search),
    queryFn: () =>
      fetchOperationsWorkOrderList(page + 1, pageSize, operationsId, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    enabled: !!operationsId,
  });
}

export function useWorkOrderById(workOrderId?: number) {
  return useQuery({
    queryKey: qkWorkOrder.detail(workOrderId ?? 0),
    queryFn: () => fetchOperationsWorkOrderById(workOrderId!),
    enabled: !!workOrderId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderCreateDto) => {
      showLoading("Creando orden de trabajo...");
      return createOperationsWorkOrder(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrder.lists() });
        showSuccess(resp.message || "Orden de trabajo creada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsWorkOrderUpdateDto) => {
      showLoading("Actualizando orden de trabajo...");
      return updateOperationsWorkOrder(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrder.all });
        showSuccess(resp.message || "Orden de trabajo actualizada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workOrderId: number) => {
      showLoading("Eliminando orden de trabajo...");
      return deleteOperationsWorkOrder(workOrderId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkWorkOrder.all });
        showSuccess(resp.message || "Orden de trabajo eliminada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useWorkOrderSelect(
  operationsId: number,
  page: number = 1,
  pageSize: number = 500,
  search: string = ""
) {
  return useQuery({
    queryKey: qkWorkOrder.select(operationsId, page, pageSize, search),
    queryFn: () =>
      fetchOperationsWorkOrderSelect(operationsId, page, pageSize, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    enabled: !!operationsId,
  });
}
