import type {
  ConceptGroupsResponseDto,
  ConceptGroupsUpsertDto,
} from "@/application";
import { 
  createConceptGroups, 
  updateConceptGroups, 

} from "@/infrastructure";
import {
  closeAlert,
  qkConceptGroups, 
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";


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

export const useConceptGroupsMutations = () => {
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
        
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkConceptGroups.all, 
          exact: false,
          type: "active", 
        });

        
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


  const updateMut = useMutation<GlobalResponse,unknown,ConceptGroupsUpsertDto>({
    mutationFn: updateConceptGroups,
    onMutate: () => showLoading("Actualizando grupo de conceptos..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
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
          
        }
        
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

  return { createMut, updateMut };
}