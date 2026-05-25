import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProductLinesByIdDto,
  ProductLinesResponseDto,
  ProductLinesStatusDto,
  ProductLinesUpsertDto,
} from "@/application";
import {
  createProductLines,
  fetchProductLinesById,
  fetchProductLinesList,
  fetchProductLinesSelect,
  updateProductLines,
  updateProductLinesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkProductLines } from "../keys/qkProductLines";

export function useProductLinesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<ProductLinesResponseDto>>({
    queryKey: qkProductLines.list(pageIndex, pageSize, s),
    queryFn: () => fetchProductLinesList(pageIndex + 1, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useProductLinesOptions(
  categoriesId?: number | null,
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkProductLines.select(categoriesId, page, s, pageSize),
    queryFn: () => fetchProductLinesSelect(page, s, pageSize, categoriesId),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useProductLinesById(id?: number | null) {
  return useQuery<ProductLinesByIdDto>({
    queryKey: id != null ? qkProductLines.byId(id) : qkProductLines.byId(-1),
    queryFn: () => fetchProductLinesById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useProductLinesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProductLinesUpsertDto, "productLinesId">
  >({
    mutationFn: createProductLines,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkProductLines.all,
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

  const updateMut = useMutation<GlobalResponse, unknown, ProductLinesUpsertDto>(
    {
      mutationFn: updateProductLines,
      retry: false,
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({ queryKey: qkProductLines.lists() }),
            vars.productLinesId
              ? qc.invalidateQueries({
                  queryKey: qkProductLines.byId(vars.productLinesId),
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar la línea de producto.",
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando.");
      },
    },
  );

  const statusMut = useMutation<GlobalResponse, unknown, ProductLinesStatusDto>(
    {
      mutationFn: updateProductLinesStatus,
      retry: false,
      onSuccess: async (res) => {
        closeAlert();
        if (res.status === 1) {
          await qc.invalidateQueries({
            queryKey: qkProductLines.all,
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
