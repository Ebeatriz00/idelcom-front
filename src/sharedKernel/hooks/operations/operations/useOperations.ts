import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOperations,
  deleteOperations,
  fetchOperationsById,
  fetchOperationsList,
  updateOperations,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { qkOperations } from "./operations.qk";
import { qkOrders } from "../orders/keys/qkOrders";
import type {
  OperationsCreateDto,
  OperationsUpdateDto,
} from "@/application";

export function useOperationsList(
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: qkOperations.list(page, pageSize),
    queryFn: () => fetchOperationsList(page + 1, pageSize),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useOperationsById(operationsId?: number) {
  return useQuery({
    queryKey: qkOperations.detail(operationsId ?? 0),
    queryFn: () => fetchOperationsById(operationsId!),
    enabled: !!operationsId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateOperations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsCreateDto) => {
      showLoading("Creando operación...");
      return createOperations(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperations.lists() });
        showSuccess(resp.message || "Operación creada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateOperations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsUpdateDto) => {
      showLoading("Actualizando operación...");
      return updateOperations(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperations.all });
        queryClient.invalidateQueries({ queryKey: qkOrders.all });
        showSuccess(resp.message || "Operación actualizada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteOperations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operationsId: number) => {
      showLoading("Eliminando operación...");
      return deleteOperations(operationsId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperations.all });
        showSuccess(resp.message || "Operación eliminada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
