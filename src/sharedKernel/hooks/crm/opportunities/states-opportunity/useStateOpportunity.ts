import type {
  OptionItem,
  PagedSelect,
  Paginated,
  StateOpportunityByIdDto,
  StateOpportunityResponseDto,
  StateOpportunityStatusDto,
  StateOpportunityUpsertDto,
} from "@/application";
import {
  createStateOpportunity,
  fetchStateOpportunityById,
  fetchStateOpportunityList,
  fetchStateOpportunitySelect,
  updateStateOpportunity,
  updateStateOpportunityStatus,
} from "@/infrastructure";
import { useCrmStatePerms } from "@/pages/crm/opportunities/states/hooks/state.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkStateOpportunity = {
  all: ["states-oportunity"] as const,
  lists: () => [...qkStateOpportunity.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkStateOpportunity.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkStateOpportunity.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkStateOpportunity.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkStateOpportunity.all, "by-id", id] as const,
};

export function useStateOpportunityList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllState, isLoadingPerms} = useCrmStatePerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllState
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllState ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllState || !!userId);   

  return useQuery<Paginated<StateOpportunityResponseDto>>({
    queryKey: qkStateOpportunity.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchStateOpportunityList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useStateOpportunityOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 100,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkStateOpportunity.select(page, s, pageSize),
    queryFn: () => fetchStateOpportunitySelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useStateOpportunityById(id?: number | null) {
  return useQuery<StateOpportunityByIdDto>({
    queryKey:
      id != null ? qkStateOpportunity.byId(id) : qkStateOpportunity.byId(-1),
    queryFn: () => fetchStateOpportunityById(id as number),
    enabled: id != null,
  });
}

export function useStateOpportunityMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<StateOpportunityByIdDto, "stateOpportunityId">
  >({
    mutationFn: createStateOpportunity,
    onMutate: () => showLoading("Creando estado de oportunidades..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkStateOpportunity.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la estado de oportunidades."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando estado de oportunidades.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    StateOpportunityUpsertDto
  >({
    mutationFn: updateStateOpportunity,
    onMutate: () => showLoading("Actualizando estado de oportunidades..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkStateOpportunity.lists() }),
          vars.stateOpportunityId
            ? qc.invalidateQueries({
                queryKey: qkStateOpportunity.byId(vars.stateOpportunityId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la estado de oportunidades."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando estado de oportunidades.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    StateOpportunityStatusDto
  >({
    mutationFn: updateStateOpportunityStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkStateOpportunity.lists(),
            refetchType: "active",
          }),
          vars.stateOpportunityId
            ? qc.invalidateQueries({
                queryKey: qkStateOpportunity.byId(vars.stateOpportunityId),
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
