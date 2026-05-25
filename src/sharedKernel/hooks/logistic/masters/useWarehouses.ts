import type {
  OptionItem,
  PagedSelect,
  Paginated,
  WarehousesResponseDto,
  WarehousesStatusDto,
  WarehousesUpsertDto,
} from "@/application";
import {
  createWarehouses,
  fetchWarehousesById,
  fetchWarehousesList,
  fetchWarehousesSelect,
  updateWarehouses,
  updateWarehousesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkWarehouses } from "../keys/qkWarehouses";

export function useWarehousesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<WarehousesResponseDto>>({
    queryKey: qkWarehouses.list(pageIndex, pageSize, s),
    queryFn: () => fetchWarehousesList(pageIndex + 1, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useWarehousesById(id?: number | null) {
  return useQuery<WarehousesResponseDto>({
    queryKey: id != null ? qkWarehouses.byId(id) : qkWarehouses.byId(-1),
    queryFn: () => fetchWarehousesById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useWarehousesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWarehouses.select(page, s, pageSize),
    queryFn: () => fetchWarehousesSelect(page, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWarehousesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<WarehousesUpsertDto, "warehousesId">
  >({
    mutationFn: createWarehouses,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkWarehouses.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el almacén.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando almacén.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, WarehousesUpsertDto>({
    mutationFn: updateWarehouses,
    onMutate: () => showLoading("Actualizando almacén..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);

        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkWarehouses.lists(),
            exact: false,
          }),
          vars.warehousesId
            ? qc.invalidateQueries({
                queryKey: qkWarehouses.byId(vars.warehousesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el almacén.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando almacén.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, WarehousesStatusDto>({
    mutationFn: updateWarehousesStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkWarehouses.lists(),
            exact: false,
          }),
          vars.warehousesId
            ? qc.invalidateQueries({
                queryKey: qkWarehouses.byId(vars.warehousesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}
