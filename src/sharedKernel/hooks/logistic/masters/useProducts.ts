import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProductsResponseDto,
  ProductsStatusDto,
  ProductsUpsertDto,
} from "@/application";

import {
  createProducts,
  fetchProductsById,
  fetchProductsList,
  fetchProductsSelect,
  updateProducts,
  updateProductsStatus,
} from "@/infrastructure/api-clients/logistic/masters/products.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkProducts } from "../keys/qkProducts";

export function useProductsList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  categoriesId?: number,
  productTypeId?: number,
  brandsId?: number,
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<ProductsResponseDto>>({
    queryKey: qkProducts.list(
      pageIndex,
      pageSize,
      s,
      categoriesId,
      productTypeId,
      brandsId,
    ),
    queryFn: () =>
      fetchProductsList(
        pageIndex + 1,
        pageSize,
        s,
        categoriesId,
        productTypeId,
        brandsId,
      ),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useProductsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkProducts.select(page, s, pageSize),
    queryFn: () => fetchProductsSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useProductsById(id?: number | null) {
  return useQuery<ProductsResponseDto>({
    queryKey: id != null ? qkProducts.byId(id) : qkProducts.byId(-1),
    queryFn: () => fetchProductsById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useProductsMutations() {
  const qc = useQueryClient();
  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProductsUpsertDto, "productsId">
  >({
    mutationFn: createProducts,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkProducts.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el producto.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando producto.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ProductsUpsertDto>({
    mutationFn: updateProducts,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkProducts.lists() }),
          vars.productsId
            ? qc.invalidateQueries({
                queryKey: qkProducts.byId(vars.productsId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el producto.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando producto.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ProductsStatusDto>({
    mutationFn: updateProductsStatus,
    retry: false,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando producto..."
          : "Desactivando producto...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkProducts.all,
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
  });

  return {
    createMut,
    updateMut,
    statusMut,
  };
}
