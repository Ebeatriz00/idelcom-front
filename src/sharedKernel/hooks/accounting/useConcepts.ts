import type {
  Paginated,
  ConceptsUpsertDto,
  ConceptsResponseDto,
  ConceptsStatusDto,
} from "@/application";
import {
  createConcepts,
  fetchConceptsById,
  fetchConceptsList,
  updateConcepts,
  updateConceptsStatus,
} from "@/infrastructure";
import { useAccConceptPerms } from "@/pages/accounting/concepts/hooks/concepts.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const qkConcepts = {
  all: ["concepts"] as const,
  lists: () => [...qkConcepts.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkConcepts.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkConcepts.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkConcepts.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkConcepts.all, "by-id", id] as const,
};

function patchConceptsListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ConceptsResponseDto) => boolean,
  updater: (it: ConceptsResponseDto) => ConceptsResponseDto
) {
  const caches = qc.getQueriesData<{ items: ConceptsResponseDto[] }>({
    queryKey: qkConcepts.lists(),
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



export function useConceptsList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllConcept, isLoadingPerms} = useAccConceptPerms();
  const userIdstr = useAuth((s) => s.userId);
  const userId = userIdstr !=null ? Number(userIdstr) : undefined;
  const usersBy: number | undefined = canViewAllConcept
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllConcept ? "all" : userIdstr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllConcept || !!userId);

  return useQuery<Paginated<ConceptsResponseDto>>({
    queryKey: qkConcepts.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchConceptsList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000, 
    enabled,
  });
}

export function useConceptsById(id?: number | null) {
  return useQuery<ConceptsResponseDto>({
    queryKey: id != null ? qkConcepts.byId(id) : qkConcepts.byId(-1),
    queryFn: () => fetchConceptsById(id as number),
    enabled: id != null,
  });
}


export function useConceptsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ConceptsUpsertDto, "conceptsId">
  >({
    mutationFn: createConcepts,
    onMutate: () => showLoading("Registrando nuevo concepto..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkConcepts.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
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
    ConceptsUpsertDto
  >({
    mutationFn: updateConcepts,
    onMutate: () => showLoading("Actualizando concepto..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        if (vars.conceptsId) {

          patchConceptsListsAfterUpdate(
            qc,
            (it) => it.conceptsId === vars.conceptsId,
            (it) => ({
              ...it,
              description: vars.description,
              
            })
          );

          await qc.invalidateQueries({
            queryKey: qkConcepts.byId(vars.conceptsId),
          });
        }
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar.");
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
    ConceptsStatusDto
  >({
    mutationFn: updateConceptsStatus,
    onMutate: (vars) =>
      showLoading(vars.status === "1" ? "Activando concepto..." : "Desactivando concepto..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkConcepts.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo cambiar el estado.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}