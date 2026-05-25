import type {
  AvailableStockDto,
  Paginated,
  WarehousesMovementByIdDto,
  WarehousesMovementResponseDto,
  WarehousesMovementUpsertDto,
} from "@/application";
import {
  createWarehousesMovement,
  fetchAvailableStock,
  fetchWarehousesMovementById,
  fetchWarehousesMovementList,
} from "@/infrastructure/api-clients/logistic/operationwarehouses/WarehousesMovement.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkWarehousesMovement } from "../keys/qk.WarehousesMovement";

export function useWarehousesMovementList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  movementTypeId?: number,
  movOperId?: number,
  warehouseId?: number,
  dateFrom?: string,
  dateTo?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<WarehousesMovementResponseDto>>({
    queryKey: qkWarehousesMovement.list(
      pageIndex,
      pageSize,
      s,
      movementTypeId,
      movOperId,
      warehouseId,
      dateFrom,
      dateTo,
    ),
    queryFn: () =>
      fetchWarehousesMovementList(
        pageIndex + 1,
        pageSize,
        s,
        movementTypeId,
        movOperId,
        warehouseId,
        dateFrom,
        dateTo,
      ),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useWarehousesMovementById(id?: number | null) {
  return useQuery<WarehousesMovementByIdDto>({
    queryKey:
      id != null
        ? qkWarehousesMovement.byId(id)
        : qkWarehousesMovement.byId(-1),
    queryFn: () => fetchWarehousesMovementById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useAvailableStock(
  warehouseId?: number,
  productsId?: number,
  search?: string,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  return useQuery<AvailableStockDto[]>({
    queryKey: qkWarehousesMovement.availableStock(
      warehouseId,
      productsId,
      s,
    ),
    queryFn: () => fetchAvailableStock(warehouseId, productsId, s),
    retry: false,
    enabled: (opts?.enabled ?? true) && !!warehouseId,
  });
}

export function useWarehousesMovementMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    WarehousesMovementUpsertDto
  >({
    mutationFn: createWarehousesMovement,
    retry: false,
    onMutate: () => showLoading("Registrando movimiento de almacen..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Exito", res.message);
        await qc.invalidateQueries({
          queryKey: qkWarehousesMovement.lists(),
          exact: false,
        });
        await qc.invalidateQueries({
          queryKey: qkWarehousesMovement.all,
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el movimiento de almacen.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando movimiento de almacen.");
    },
  });

  return { createMut };
}
