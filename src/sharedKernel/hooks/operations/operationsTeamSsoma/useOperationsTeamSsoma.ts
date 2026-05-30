import {
  createOperationsTeamSsoma,
  fetchActiveSsomaAssignmentByWorkerId,
  fetchOperationsTeamSsomaById,
  fetchOperationsTeamSsomaListByProcessId,
  processSsomaAssignmentRelocation,
  processSsomaAssignmentReplacement,
  processSsomaAssignmentUpdate,
  updateOperationsTeamSsoma,
  deleteOperationsTeamSsoma,
} from "@/infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkOperationsTeamSsoma } from "./operationsTeamSsoma.qk";
import type {
  OperationsTeamSsomaCreateDto,
  OperationsTeamSsomaUpdateDto,
  ProcessSsomaAssignmentChangeDto,
} from "@/application";
import { showApiError, showSuccess } from "@/sharedKernel";

export function useOperationsTeamSsomaListByProcessId(ssomaProcessId: number) {
  return useQuery({
    queryKey: qkOperationsTeamSsoma.list(ssomaProcessId),
    queryFn: () => fetchOperationsTeamSsomaListByProcessId(ssomaProcessId),
    enabled: !!ssomaProcessId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useOperationsTeamSsomaById(operationsTeamSsomaId: number) {
  return useQuery({
    queryKey: qkOperationsTeamSsoma.detail(operationsTeamSsomaId),
    queryFn: () => fetchOperationsTeamSsomaById(operationsTeamSsomaId),
    enabled: !!operationsTeamSsomaId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useActiveSsomaAssignmentByWorkerId(workerId: number) {
  return useQuery({
    queryKey: qkOperationsTeamSsoma.activeAssignment(workerId),
    queryFn: () => fetchActiveSsomaAssignmentByWorkerId(workerId),
    enabled: !!workerId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateOperationsTeamSsoma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsTeamSsomaCreateDto) => {
      return createOperationsTeamSsoma(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", "Se agregó correctamente al equipo SSOMA.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}

export function useUpdateOperationsTeamSsoma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsTeamSsomaUpdateDto) => {
      return updateOperationsTeamSsoma(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", res.message || "Equipo SSOMA actualizado correctamente.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}

export function useProcessSsomaAssignmentUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProcessSsomaAssignmentChangeDto) => {
      return processSsomaAssignmentUpdate(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", res.message || "Actualización de asignación procesada.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}

export function useProcessSsomaAssignmentRelocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProcessSsomaAssignmentChangeDto) => {
      return processSsomaAssignmentRelocation(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", res.message || "Reubicación de asignación procesada.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}

export function useProcessSsomaAssignmentReplacement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProcessSsomaAssignmentChangeDto) => {
      return processSsomaAssignmentReplacement(dto);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", res.message || "Reemplazo de asignación procesado.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}

export function useDeleteOperationsTeamSsoma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operationsTeamSsomaId: number) => {
      return deleteOperationsTeamSsoma(operationsTeamSsomaId);
    },
    onSuccess: async (res) => {
      if (res.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkOperationsTeamSsoma.all });
        await showSuccess("Éxito", res.message || "Asignación eliminada correctamente.");
      } else {
        await showApiError(res.message);
      }
    },
    onError: async (err) => {
      await showApiError(err);
    }
  });
}
