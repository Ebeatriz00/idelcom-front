import type { SsomaProcessUpsertDto } from "@/application";
import {
  createSsomaProcess,
  deleteSsomaProcess,
  fetchSsomaProcessById,
  fetchSsomaProcessList,
  updateSsomaProcess,
} from "@/infrastructure";
import { showApiError, showSuccess } from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSsomaProcess } from "./ssomaProcess.qk";

export function useSsomaProcessList(
  page: number,
  pageSize: number,
  operationsId: number | null | undefined,
  search: string,
  enabled = true,
) {
  const normalizedOperationsId = operationsId && operationsId > 0 ? operationsId : null;

  return useQuery({
    queryKey: qkSsomaProcess.list(page, pageSize, normalizedOperationsId, search),
    queryFn: () =>
      fetchSsomaProcessList(page, pageSize, normalizedOperationsId, search),
    enabled,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSsomaProcessById(
  ssomaProcessId?: number,
  operationsId?: number,
) {
  return useQuery({
    queryKey: qkSsomaProcess.detail(ssomaProcessId ?? 0),
    queryFn: () => fetchSsomaProcessById(ssomaProcessId!, operationsId!),
    enabled: !!ssomaProcessId && !!operationsId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateSsomaProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SsomaProcessUpsertDto) => {
      return createSsomaProcess(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSsomaProcess.lists() });
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    },
  });
}

export function useUpdateSsomaProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SsomaProcessUpsertDto) => {
      return updateSsomaProcess(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSsomaProcess.all });
        await showSuccess(
          "Éxito",
          res.message || "Proceso SSOMA actualizado correctamente.",
        );
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    },
  });
}

export function useDeleteSsomaProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ssomaProcessId,
      operationsId,
    }: {
      ssomaProcessId: number;
      operationsId: number;
    }) => {
      return deleteSsomaProcess(ssomaProcessId, operationsId);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkSsomaProcess.all });
        await showSuccess(
          "Éxito",
          res.message || "Proceso SSOMA eliminado correctamente.",
        );
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    },
  });
}
