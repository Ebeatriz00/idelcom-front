import type {
  OptionItem,
  PagedSelect,
  Paginated,
  SuppliersResponseDto,
  SuppliersStatusDto,
  SuppliersUpsertDto,
} from "@/application";
import {
  createSuppliers,
  fetchSuppliersById,
  fetchSuppliersList,
  fetchSuppliersSelect,
  updateSuppliers,
  updateSuppliersStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSuppliers } from "../keys/qkSuppliers";

export function useSuppliersList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<SuppliersResponseDto>>({
    queryKey: qkSuppliers.list(pageIndex, pageSize, s),
    queryFn: () => fetchSuppliersList(pageIndex + 1, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useSuppliersById(id?: number | null) {
  return useQuery<SuppliersResponseDto>({
    queryKey: id != null ? qkSuppliers.byId(id) : qkSuppliers.byId(-1),
    queryFn: () => fetchSuppliersById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useSuppliersOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkSuppliers.select(page, s, pageSize),
    queryFn: () => fetchSuppliersSelect(page, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSuppliersMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<SuppliersUpsertDto, "suppliersId">
  >({
    mutationFn: createSuppliers,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkSuppliers.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el proveedor.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando proveedor.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, SuppliersUpsertDto>({
    mutationFn: updateSuppliers,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkSuppliers.lists(), exact: false }),
          vars.suppliersId
            ? qc.invalidateQueries({
                queryKey: qkSuppliers.byId(vars.suppliersId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el proveedor.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando proveedor.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, SuppliersStatusDto>({
    mutationFn: updateSuppliersStatus,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkSuppliers.lists(),
            exact: false,
          }),
          vars.suppliersId
            ? qc.invalidateQueries({
                queryKey: qkSuppliers.byId(vars.suppliersId),
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
