import type {
  CategoriesResponseDto,
  CategoriesStatusDto,
  CategoriesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createCategories,
  fetchCategoriesById,
  fetchCategoriesList,
  fetchCategoriesSelect,
  updateCategories,
  updateCategoriesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkCategories } from "../keys/qkCategories";

export function useCategoriesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkCategories.select(page, s, pageSize),
    queryFn: () => fetchCategoriesSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useCategoriesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<CategoriesResponseDto>>({
    queryKey: qkCategories.list(pageIndex, pageSize, s),
    queryFn: () => fetchCategoriesList(pageIndex + 1, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCategoriesById(id?: number | null) {
  return useQuery<CategoriesResponseDto>({
    queryKey: id != null ? qkCategories.byId(id) : qkCategories.byId(-1),
    queryFn: () => fetchCategoriesById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useCategoriesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CategoriesUpsertDto, "categoriesId">
  >({
    mutationFn: createCategories,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkCategories.all,
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

  const updateMut = useMutation<GlobalResponse, unknown, CategoriesUpsertDto>({
    mutationFn: updateCategories,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkCategories.lists() }),
          vars.categoriesId
            ? qc.invalidateQueries({
                queryKey: qkCategories.byId(vars.categoriesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, CategoriesStatusDto>({
    mutationFn: updateCategoriesStatus,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkCategories.all,
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
  });

  return { createMut, updateMut, statusMut };
}
