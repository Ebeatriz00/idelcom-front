import type {
  LeadsSourcesResponseDto,
  LeadsSourcesStatusDto,
  LeadsSourcesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createLeadsSources,
  fetchLeadsSourcesById,
  fetchLeadsSourcesList,
  fetchLeadsSourcesSelect,
  updateLeadsSources,
  updateLeadsSourcesStatus,
} from "@/infrastructure";
import { useCrmSourcesPerms } from "@/pages/crm/leads/sources/hooks/permissions/sources.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkLeadsSources = {
  all: ["leads-sources"] as const,
  lists: () => [...qkLeadsSources.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkLeadsSources.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkLeadsSources.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkLeadsSources.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkLeadsSources.all, "by-id", id] as const,
};

export function useLeadsSourcesList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllSources, isLoadingPerms} = useCrmSourcesPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllSources
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllSources ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllSources || !!userId);  

  return useQuery<Paginated<LeadsSourcesResponseDto>>({
    queryKey: qkLeadsSources.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchLeadsSourcesList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useLeadsSourcesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLeadsSources.select(page, s, pageSize),
    queryFn: () => fetchLeadsSourcesSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useLeadsSourcesById(id?: number | null) {
  return useQuery<LeadsSourcesResponseDto>({
    queryKey: id != null ? qkLeadsSources.byId(id) : qkLeadsSources.byId(-1),
    queryFn: () => fetchLeadsSourcesById(id as number),
    enabled: id != null,
  });
}

export function useLeadsSourcesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<LeadsSourcesUpsertDto, "leadsSourcesId">
  >({
    mutationFn: createLeadsSources,
    onMutate: () => showLoading("Creando fuente leads..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkLeadsSources.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la fuente leads."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando fuente leads.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, LeadsSourcesUpsertDto>(
    {
      mutationFn: updateLeadsSources,
      onMutate: () => showLoading("Actualizando fuente leads..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({ queryKey: qkLeadsSources.lists() }),
            vars.leadsSourcesId
              ? qc.invalidateQueries({
                  queryKey: qkLeadsSources.byId(vars.leadsSourcesId),
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar la fuente leads."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando fuente leads.");
      },
    }
  );

  const statusMut = useMutation<GlobalResponse, unknown, LeadsSourcesStatusDto>(
    {
      mutationFn: updateLeadsSourcesStatus,
      onMutate: () => showLoading("Actualizando estado..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({
              queryKey: qkLeadsSources.lists(),
              refetchType: "active",
            }),
            vars.leadsSourcesId
              ? qc.invalidateQueries({
                  queryKey: qkLeadsSources.byId(vars.leadsSourcesId),
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
    }
  );

  return { createMut, updateMut, statusMut };
}
