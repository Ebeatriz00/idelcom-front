import type {
  Paginated,
  ConceptGroupsUpsertDto,
  ConceptGroupsResponseDto,
  ConceptGroupsStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createConceptGroups,
  fetchConceptGroupsById,
  fetchConceptGroupsList,
  fetchConceptGroupsSelect,
  updateConceptGroups,
  updateConceptGroupsStatus,
  
} from "@/infrastructure";
import { useAccGroupsPerms } from "@/pages/accounting/conceptgroups/hooks/conGroups.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkConceptGroups = {
  all: ["concept-groups"] as const,
  lists: () => [...qkConceptGroups.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkConceptGroups.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,
  
  selects: () => [...qkConceptGroups.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkConceptGroups.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkConceptGroups.all, "by-id", id] as const,
};

export function useConceptGroupsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkConceptGroups.select(page, s, pageSize),
    queryFn: () => fetchConceptGroupsSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}



function patchConceptGroupsListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ConceptGroupsResponseDto) => boolean,
  updater: (it: ConceptGroupsResponseDto) => ConceptGroupsResponseDto
) {
  const caches = qc.getQueriesData<{ items: ConceptGroupsResponseDto[] }>({
    queryKey: qkConceptGroups.lists(),
    exact: false,
  });
  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}


export function useConceptGroupsList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllAccGroups, isLoadingPerms} = useAccGroupsPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllAccGroups
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllAccGroups ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllAccGroups || !!userId);  

  return useQuery<Paginated<ConceptGroupsResponseDto>>({
    queryKey: qkConceptGroups.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchConceptGroupsList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}


export function useConceptGroupsById(id?: number | null) {
  return useQuery<ConceptGroupsResponseDto>({
    queryKey: id != null ? qkConceptGroups.byId(id) : qkConceptGroups.byId(-1),
    queryFn: () => fetchConceptGroupsById(id as number),
    enabled: id != null,
  });
}


export function useConceptGroupsMutations() {
  const qc = useQueryClient();


  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ConceptGroupsUpsertDto, "conceptGroupsId">
  >({
    mutationFn: createConceptGroups,
    onMutate: () => showLoading("Registrando nuevo grupo de conceptos..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        

        await qc.invalidateQueries({
          queryKey: qkConceptGroups.all, 
          type: "active", 
        });

        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });


  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    ConceptGroupsUpsertDto
  >({
    mutationFn: updateConceptGroups,
    onMutate: () => showLoading("Actualizando grupo de conceptos..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        
        if (vars.conceptGroupsId) {
          
          patchConceptGroupsListsAfterUpdate(
            qc,
            (it) => it.conceptGroupsId === vars.conceptGroupsId,
            (it) => ({
              ...it,
              description: vars.description,
              code: vars.code,
            })
          );
          
          await qc.invalidateQueries({
            queryKey: qkConceptGroups.byId(vars.conceptGroupsId),
          });
        }
        

        await qc.invalidateQueries({
             queryKey: qkConceptGroups.all,
             type: "active",
        });

        await showSuccess("Éxito", res.message);
        
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });


  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    ConceptGroupsStatusDto
  >({
    mutationFn: updateConceptGroupsStatus,
    onMutate: (vars) => showLoading(
      vars.status === "1" ? "Activando grupo de conceptos..." : "Desactivando grupo de conceptos..."
    ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        

        await qc.invalidateQueries({
          queryKey: qkConceptGroups.all,
          type: "active",
        });

        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
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