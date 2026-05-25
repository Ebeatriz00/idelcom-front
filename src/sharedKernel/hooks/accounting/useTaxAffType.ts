import type {
  OptionItem,
  PagedSelect,
  Paginated,
  TaxAffTypeResponseDto,
  TaxAffTypeStatusDto,
  TaxAffTypeUpsertDto,
} from "@/application";
import {
  createTaxAffType,
  fetchTaxAffTypeById,
  fetchTaxAffTypeList,
  fetchTaxAffTypeSelect,
  updateTaxAffType,
  updateTaxAffTypeStatus,
} from "@/infrastructure";
import { useAccTaxAffPerms } from "@/pages/accounting/tax-affectation-type/hooks/taxAff.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkTaxAffType = {
  all: ["tax-aff-type"] as const,
  lists: () => [...qkTaxAffType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkTaxAffType.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkTaxAffType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTaxAffType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkTaxAffType.all, "by-id", id] as const,
};

export function useTaxAffTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllTaxAff, isLoadingPerms} = useAccTaxAffPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllTaxAff
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllTaxAff ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllTaxAff || !!userId);  

  return useQuery<Paginated<TaxAffTypeResponseDto>>({
    queryKey: qkTaxAffType.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchTaxAffTypeList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useTaxAffTypeOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTaxAffType.select(page, s, pageSize),
    queryFn: () => fetchTaxAffTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useTaxAffTypeById(id?: number | null) {
  return useQuery<TaxAffTypeResponseDto>({
    queryKey: id != null ? qkTaxAffType.byId(id) : qkTaxAffType.byId(-1),
    queryFn: () => fetchTaxAffTypeById(id as number),
    enabled: id != null,
  });
}

export function useTaxAffTypeMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<TaxAffTypeUpsertDto, "TaxAffTypeId">
  >({
    mutationFn: createTaxAffType,
    onMutate: () => showLoading("Creando tipo afectación tributaria..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkTaxAffType.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la tipo afectación tributaria."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo afectación tributaria.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, TaxAffTypeUpsertDto>({
    mutationFn: updateTaxAffType,
    onMutate: () => showLoading("Actualizando tipo afectación tributaria..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkTaxAffType.lists() }),
          vars.taxAffTypeId
            ? qc.invalidateQueries({
                queryKey: qkTaxAffType.byId(vars.taxAffTypeId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tipo afectación tributaria."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo afectación tributaria.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, TaxAffTypeStatusDto>({
    mutationFn: updateTaxAffTypeStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkTaxAffType.lists(),
            refetchType: "active",
          }),
          vars.taxAffTypeId
            ? qc.invalidateQueries({
                queryKey: qkTaxAffType.byId(vars.taxAffTypeId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
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
