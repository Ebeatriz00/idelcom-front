import {
  createOperationsPersonnelAssignment,
  deleteOperationsPersonnelAssignment,
  fetchOperationsPersonnelAssignmentById,
  fetchOperationsPersonnelAssignmentList,
  updateOperationsPersonnelAssignment,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkAssignment } from "./assignment.qk";
import type {
  OperationsPersonnelAssignmentCreateDto,
  OperationsPersonnelAssignmentUpdateDto,
} from "@/application";

export function useAssignmentList(
  page: number,
  pageSize: number,
  search: string = ""
) {
  return useQuery({
    queryKey: qkAssignment.list(page, pageSize, search),
    queryFn: () => fetchOperationsPersonnelAssignmentList(page + 1, pageSize, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useAssignmentById(assignmentId?: number) {
  return useQuery({
    queryKey: qkAssignment.detail(assignmentId ?? 0),
    queryFn: () => fetchOperationsPersonnelAssignmentById(assignmentId!),
    enabled: !!assignmentId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsPersonnelAssignmentCreateDto) => {
      showLoading("Asignando personal...");
      return createOperationsPersonnelAssignment(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkAssignment.lists() });
        showSuccess(resp.message || "Personal asignado correctamente");
      } else {
        // Si el status es 0 (error controlado del SP), mostramos el mensaje como advertencia
        Swal.fire({
          icon: "warning",
          title: "Aviso de Asignación",
          text: resp.message || "No se pudo realizar la asignación.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3b82f6"
        });
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationsPersonnelAssignmentUpdateDto) => {
      showLoading("Actualizando asignación...");
      return updateOperationsPersonnelAssignment(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkAssignment.all });
        showSuccess(resp.message || "Asignación actualizada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => {
      showLoading("Eliminando asignación...");
      return deleteOperationsPersonnelAssignment(assignmentId);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkAssignment.all });
        showSuccess(resp.message || "Asignación eliminada correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
