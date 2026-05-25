import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProductTypesResponseDto,
  ProductTypesStatusDto,
  ProductTypesUpsertDto,
} from "@/application";
import {
  createProductTypes,
  fetchProductTypesById,
  fetchProductTypesList,
  fetchProductTypesSelect,
  updateProductTypes,
  updateProductTypesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkProductTypes } from "../keys/qkProductTypes";

export function useProductTypesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkProductTypes.select(page, s, pageSize),
    queryFn: () => fetchProductTypesSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useProductTypesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<ProductTypesResponseDto>>({
    queryKey: qkProductTypes.list(pageIndex, pageSize, s),
    retry: false,
    queryFn: () => fetchProductTypesList(pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useProductTypesById(id?: number | null) {
  return useQuery<ProductTypesResponseDto>({
    queryKey: id != null ? qkProductTypes.byId(id) : qkProductTypes.byId(-1),
    queryFn: () => fetchProductTypesById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useProductTypesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProductTypesUpsertDto, "productTypesId">
  >({
    mutationFn: createProductTypes,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkProductTypes.all,
          type: "active",
        });

        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ProductTypesUpsertDto>(
    {
      mutationFn: updateProductTypes,
      retry: false,
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({ queryKey: qkProductTypes.lists() }),
            vars.productTypesId
              ? qc.invalidateQueries({
                  queryKey: qkProductTypes.byId(vars.productTypesId),
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar el tipo de producto.",
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando.");
      },
    },
  );

  const statusMut = useMutation<GlobalResponse, unknown, ProductTypesStatusDto>(
    {
      mutationFn: updateProductTypesStatus,
      retry: false,
      onSuccess: async (res) => {
        closeAlert();
        if (res.status === 1) {
          await qc.invalidateQueries({
            queryKey: qkProductTypes.all,
            type: "active",
          });

          await showSuccess("Éxito", res.message);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo cambiar el estado.",
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error al cambiar el estado.");
      },
    },
  );

  return { createMut, updateMut, statusMut };
}
