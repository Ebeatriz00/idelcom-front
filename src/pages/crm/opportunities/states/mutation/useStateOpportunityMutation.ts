import type {
  StateOpportunityByIdDto,
  StateOpportunityUpsertDto,
} from "@/application";
import {
  createStateOpportunity,
  updateStateOpportunity,
} from "@/infrastructure";
import {
  closeAlert,
  qkStateOpportunity,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchStateOpportunityListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: StateOpportunityByIdDto) => boolean,
  updater: (it: StateOpportunityByIdDto) => StateOpportunityByIdDto
) {
  const caches = qc.getQueriesData<{ items: StateOpportunityByIdDto[] }>({
    queryKey: qkStateOpportunity.lists(),
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

export const useStateOpportunityMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<StateOpportunityUpsertDto, "stateOpportunityId">
  >({
    mutationFn: createStateOpportunity,
    onMutate: () => showLoading("Registrando estado de oportunidades..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkStateOpportunity.lists(),
          exact: false,
          refetchType: "active",
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
        if (vars.stateOpportunityId) {
          patchStateOpportunityListsAfterUpdate(
            qc,
            (it) => it.stateOpportunityId === vars.stateOpportunityId,
            (it) => ({
              ...it,
              stateColor: vars.stateColor,
              stateDesc: vars.stateDesc,
              numPercPro: vars.numPercPro,
              numOrder: vars.numOrder,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkStateOpportunity.byId(vars.stateOpportunityId),
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
