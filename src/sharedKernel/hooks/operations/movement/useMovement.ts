import {
  createOperationPersonnelMovement,
  fetchOperationPersonnelMovementList,
} from "@/infrastructure";
import {
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkMovement } from "./movement.qk";
import type { OperationPersonnelMovementCreateDto } from "@/application";

export function useMovementList(
  page: number,
  pageSize: number,
  search: string = ""
) {
  return useQuery({
    queryKey: qkMovement.list(page, pageSize, search),
    queryFn: () => fetchOperationPersonnelMovementList(page + 1, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OperationPersonnelMovementCreateDto) => {
      showLoading("Registrando movimiento...");
      return createOperationPersonnelMovement(dto);
    },
    onSuccess: (resp) => {
      if (resp.status === 1) {
        queryClient.invalidateQueries({ queryKey: qkMovement.lists() });
        showSuccess(resp.message || "Movimiento registrado correctamente");
      } else {
        showApiError(resp.message);
      }
    },
    onError: (err) => showApiError(err),
  });
}
