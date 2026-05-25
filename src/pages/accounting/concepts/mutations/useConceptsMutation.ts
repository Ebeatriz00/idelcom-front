import type { ConceptsResponseDto, ConceptsUpsertDto } from "@/application";
import { createConcepts, updateConcepts } from "@/infrastructure";
import {
  closeAlert,
  qkConcepts, 
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";


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

export const useConceptsMutations = () => {
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
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkConcepts.all,
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

  const updateMut = useMutation<GlobalResponse, unknown, ConceptsUpsertDto>({
    mutationFn: updateConcepts,
    onMutate: () => showLoading("Actualizando concepto..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
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
};