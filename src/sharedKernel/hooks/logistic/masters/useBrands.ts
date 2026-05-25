import type {
  BrandsResponseDto,
  BrandsStatusDto,
  BrandsUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createBrands,
  fetchBrandsById,
  fetchBrandsList,
  fetchBrandsSelect,
  updateBrands,
  updateBrandsStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkBrands } from "../keys/qkBrands";

export function useBrandsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkBrands.select(page, s, pageSize),
    queryFn: () => fetchBrandsSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useBrandsList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  return useQuery<Paginated<BrandsResponseDto>>({
    queryKey: qkBrands.list(pageIndex, pageSize, s),
    queryFn: () => fetchBrandsList(pageIndex + 1, pageSize, s),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useBrandsById(id?: number | null) {
  return useQuery<BrandsResponseDto>({
    queryKey: id != null ? qkBrands.byId(id) : qkBrands.byId(-1),
    queryFn: () => fetchBrandsById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function useBrandsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BrandsUpsertDto, "brandsId">
  >({
    mutationFn: createBrands,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkBrands.all,
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

  const updateMut = useMutation<GlobalResponse, unknown, BrandsUpsertDto>({
    mutationFn: updateBrands,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkBrands.lists() }),
          vars.brandsId
            ? qc.invalidateQueries({
                queryKey: qkBrands.byId(vars.brandsId),
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

  const statusMut = useMutation<GlobalResponse, unknown, BrandsStatusDto>({
    mutationFn: updateBrandsStatus,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkBrands.all,
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
