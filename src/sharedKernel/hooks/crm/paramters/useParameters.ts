import type {
  CommercialParametersResponseDto,
  CommercialParametersStatusDto,
  CommercialParametersUpsertDto,
  Paginated,
} from "@/application";
import {
  createCommercialParameters,
  fetchCommercialParametersById,
  fetchCommercialParametersList,
  fetchViabilityLimit,
  updateCommercialParameters,
  updateCommercialParametersStatus,
  type ViabilityLimits,
} from "@/infrastructure";
import { useCrmParametersPerms } from "@/pages/crm/parameters/hooks/parameters.perms";
import type { GlobalResponse } from "@/sharedKernel";
import {
  closeAlert,
  showLoading,
  showSuccess,
} from "@/sharedKernel/alerts/alerts";
import { showApiError } from "@/sharedKernel/alerts/showApiError";
import { getBusinessIdFromStorage } from "@/stores";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkCommParameters = {
  all: ["CommParameters-crm"] as const,
  lists: () => [...qkCommParameters.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string
  ) =>
    [
      ...qkCommParameters.lists(),
      pageIndex,
      pageSize,
      search,
      usersKey,
    ] as const,

  byId: (id: number) => [...qkCommParameters.all, "by-id", id] as const,
};

export function useCommercialParametersList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const { canViewAllCommParameters, isLoadingPerms } = useCrmParametersPerms();
  const usersByStr = useAuth((s) => s.userId);
  const userId = usersByStr != null ? Number(usersByStr) : undefined;
  const usersBy: number | undefined = canViewAllCommParameters
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllCommParameters
    ? "all"
    : usersByStr ?? "all";

  const enabled = !isLoadingPerms && (canViewAllCommParameters || !!userId);

  return useQuery<Paginated<CommercialParametersResponseDto>>({
    queryKey: qkCommParameters.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () =>
      fetchCommercialParametersList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}
export function useCommercialParametersById(id?: number | null) {
  return useQuery<CommercialParametersResponseDto>({
    queryKey:
      id != null ? qkCommParameters.byId(id) : qkCommParameters.byId(-1),
    queryFn: () => fetchCommercialParametersById(id as number),
    enabled: id != null,
  });
}

export function useViabilityLimit() {
  const bid = getBusinessIdFromStorage();

  return useQuery<ViabilityLimits>({
    queryKey: ["comm-viability-limit", bid],
    queryFn: fetchViabilityLimit,
    staleTime: 5 * 60 * 1000,
    enabled: !!bid,
  });
}
export function useCommercialParametersMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CommercialParametersUpsertDto, "commercialParametersId">
  >({
    mutationFn: createCommercialParameters,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkCommParameters.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la tipo de contacto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo de contacto.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    CommercialParametersUpsertDto
  >({
    mutationFn: updateCommercialParameters,
    onMutate: () => showLoading("Actualizando tipo de contacto..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkCommParameters.lists() }),
          vars.commercialParametersId
            ? qc.invalidateQueries({
                queryKey: qkCommParameters.byId(vars.commercialParametersId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tipo de contacto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo de contacto.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    CommercialParametersStatusDto
  >({
    mutationFn: updateCommercialParametersStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkCommParameters.lists(),
            refetchType: "active",
          }),
          vars.commercialParametersId
            ? qc.invalidateQueries({
                queryKey: qkCommParameters.byId(vars.commercialParametersId),
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
