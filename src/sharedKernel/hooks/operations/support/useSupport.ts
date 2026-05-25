import {
  createSupport,
  deleteSupport,
  fetchSupportById,
  fetchSupportList,
  updateSupport,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSupport } from "./support.qk";
import type {
  SupportCreateDto,
  SupportUpdateDto,
} from "@/application";

export function useSupportList(
  page: number,
  pageSize: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkSupport.list(page, pageSize, search),
    queryFn: () => fetchSupportList(page, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useSupportById(supportId?: number) {
  return useQuery({
    queryKey: qkSupport.detail(supportId ?? 0),
    queryFn: () => fetchSupportById(supportId!),
    enabled: !!supportId,
    staleTime: 60_000,
  });
}

export function useCreateSupport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SupportCreateDto) => {
      showLoading("Registrando apoyo...");
      return createSupport(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupport.lists() });
        showSuccess(resp.message || "Apoyo registrado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateSupport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SupportUpdateDto) => {
      showLoading("Actualizando apoyo...");
      return updateSupport(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupport.all });
        showSuccess(resp.message || "Apoyo actualizado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteSupport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supportId: number) => {
      showLoading("Eliminando apoyo...");
      return deleteSupport(supportId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSupport.all });
        showSuccess(resp.message || "Apoyo eliminado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
