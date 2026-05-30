import {
  createOperationsSquad,
  deleteOperationsSquad,
  fetchOperationsSquadById,
  fetchOperationsSquadList,
  updateOperationsSquad,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSquad } from "./squad.qk";
import type {
  OperationsSquadCreateDto,
  OperationsSquadUpdateDto,
} from "@/application";

export function useSquadList(
  page: number,
  pageSize: number,
  workOrderId?: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkSquad.list(page, pageSize, workOrderId ?? 0, search),
    queryFn: () =>
      fetchOperationsSquadList(page + 1, pageSize, workOrderId, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSquadById(squadId?: number) {
  return useQuery({
    queryKey: qkSquad.detail(squadId ?? 0),
    queryFn: () => fetchOperationsSquadById(squadId!),
    enabled: !!squadId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateSquad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsSquadCreateDto) => {
      showLoading("Creando cuadrilla...");
      return createOperationsSquad(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSquad.lists() });
        showSuccess(resp.message || "Cuadrilla creada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateSquad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsSquadUpdateDto) => {
      return updateOperationsSquad(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSquad.all });
        toast.success(resp.message || "Cuadrilla actualizada correctamente");
      } else {
        toast.error(resp.message || "Ocurrió un error al actualizar la cuadrilla");
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error de conexión"),
  });
}

export function useDeleteSquad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (squadId: number) => {
      showLoading("Eliminando cuadrilla...");
      return deleteOperationsSquad(squadId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSquad.all });
        showSuccess(resp.message || "Cuadrilla eliminada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
