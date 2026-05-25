import type {
  QualificationsResponseDto,
  QualificationsUpsertDto,
} from "@/application";
import { createQualifications, updateQualifications } from "@/infrastructure";
import {
  closeAlert,
  qkQualifications,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchQualificationsListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: QualificationsResponseDto) => boolean,
  updater: (it: QualificationsResponseDto) => QualificationsResponseDto
) {
  const caches = qc.getQueriesData<{ items: QualificationsResponseDto[] }>({
    queryKey: qkQualifications.lists(),
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

export const useQualificationsMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<QualificationsUpsertDto, "leadsQualificationsId">
  >({
    mutationFn: createQualifications,
    onMutate: () => showLoading("Registrando nuevo leads de calificación..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkQualifications.lists(),
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
    QualificationsUpsertDto
  >({
    mutationFn: updateQualifications,
    onMutate: () => showLoading("Actualizando leads de calificación..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.leadsQualificationsId) {
          patchQualificationsListsAfterUpdate(
            qc,
            (it) => it.leadsQualificationsId === vars.leadsQualificationsId,
            (it) => ({
              ...it,
              description: vars.description,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkQualifications.byId(vars.leadsQualificationsId),
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
