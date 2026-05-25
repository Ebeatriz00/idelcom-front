import type {
  LeadsSourcesResponseDto,
  LeadsSourcesUpsertDto,
} from "@/application";
import { createLeadsSources, updateLeadsSources } from "@/infrastructure";
import {
  closeAlert,
  qkLeadsSources,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchLeadsSourcesListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: LeadsSourcesResponseDto) => boolean,
  updater: (it: LeadsSourcesResponseDto) => LeadsSourcesResponseDto
) {
  const caches = qc.getQueriesData<{ items: LeadsSourcesResponseDto[] }>({
    queryKey: qkLeadsSources.lists(),
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

export const useLeadsSourcesMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<LeadsSourcesUpsertDto, "leadsSourcesId">
  >({
    mutationFn: createLeadsSources,
    onMutate: () => showLoading("Registrando nuevo fuente leads..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkLeadsSources.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, LeadsSourcesUpsertDto>(
    {
      mutationFn: updateLeadsSources,
      onMutate: () => showLoading("Actualizando fuente leads..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.leadsSourcesId) {
            patchLeadsSourcesListsAfterUpdate(
              qc,
              (it) => it.leadsSourcesId === vars.leadsSourcesId,
              (it) => ({
                ...it,
                description: vars.description,
              })
            );

            await qc.invalidateQueries({
              queryKey: qkLeadsSources.byId(vars.leadsSourcesId),
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
    }
  );

  return { createMut, updateMut };
};
