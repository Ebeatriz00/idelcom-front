import type {
  CostCentersResponseDto,
  CostCentersStatusDto,
  CostCentersUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createCostCenters,
  fetchCostCentersById,
  fetchCostCentersList,
  fetchCostCentersSelect,
  updateCostCenters,
  updateCostCentersStatus,
} from "@/infrastructure";
import { useAccCostCenterPerms } from "@/pages/accounting/costcenters/hooks/contCenter.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkCostCenters = {
  all: ["cost-centers"] as const,
  lists: () => [...qkCostCenters.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkCostCenters.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkCostCenters.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkCostCenters.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkCostCenters.all, "by-id", id] as const,
};


export function useCostCentersList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllCostCenter, isLoadingPerms} = useAccCostCenterPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllCostCenter
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllCostCenter ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllCostCenter || !!userId);  
  


  return useQuery<Paginated<CostCentersResponseDto>>({
    queryKey: qkCostCenters.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchCostCentersList(pageIndex + 1, pageSize,s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled, 
  });
}


export function useCostCentersOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkCostCenters.select(page, s, pageSize),
    queryFn: () => fetchCostCentersSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000, // 30 segundos
  });
}


export function useCostCentersById(id?: number | null) {
  return useQuery<CostCentersResponseDto>({
    queryKey: id != null ? qkCostCenters.byId(id) : qkCostCenters.byId(-1),
    queryFn: () => fetchCostCentersById(id as number),
    enabled: id != null,
  });
}


export function useCostCentersMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CostCentersUpsertDto, "costCentersId">
  >({
    mutationFn: createCostCenters,
    onMutate: () => showLoading("Creando centro de costo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkCostCenters.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el centro de costo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando centro de costo.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, CostCentersUpsertDto>({
    mutationFn: updateCostCenters,
    onMutate: () => showLoading("Actualizando centro de costo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkCostCenters.lists() }),
          vars.costCentersId
            ? qc.invalidateQueries({ queryKey: qkCostCenters.byId(vars.costCentersId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el centro de costo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando centro de costo.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, CostCentersStatusDto>({
    mutationFn: updateCostCentersStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkCostCenters.lists(),
            refetchType: "active",
          }),
          vars.costCentersId
            ? qc.invalidateQueries({
                queryKey: qkCostCenters.byId(vars.costCentersId),
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