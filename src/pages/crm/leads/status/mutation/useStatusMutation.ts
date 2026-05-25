import type { LeadsStatusResponseDto, LeadsStatusUpsertDto } from "@/application";
import { createLeadsStatus, updateLeadsStatus } from "@/infrastructure";
import { closeAlert, qkLeadsStatus, showApiError, type GlobalResponse, showLoading, showSuccess } from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchLeadsStatusListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: LeadsStatusResponseDto) => boolean,
  updater: (it: LeadsStatusResponseDto) => LeadsStatusResponseDto
) {
  const caches = qc.getQueriesData<{ items: LeadsStatusResponseDto[] }>({
    queryKey: qkLeadsStatus.lists(),
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

export const useLeadsStatusMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<LeadsStatusUpsertDto, "leadsStatusId">
  >({
    mutationFn: createLeadsStatus,
    onMutate: () => showLoading("Registrando nuevo fuente leads..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkLeadsStatus.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, LeadsStatusUpsertDto>(
    {
      mutationFn: updateLeadsStatus,
      onMutate: () => showLoading("Actualizando fuente leads..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.leadsStatusId) {
            patchLeadsStatusListsAfterUpdate(
              qc,
              (it) => it.leadsStatusId === vars.leadsStatusId,
              (it) => ({
                ...it,
                description: vars.description,
              })
            );

            await qc.invalidateQueries({
              queryKey: qkLeadsStatus.byId(vars.leadsStatusId),
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
