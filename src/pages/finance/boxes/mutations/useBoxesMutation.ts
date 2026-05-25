import type { BoxesResponseDto, BoxesUpsertDto } from "@/application";
import { createBoxes, updateBoxes } from "@/infrastructure";
import {
  closeAlert,
  qkBoxes,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";


function patchBoxesListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: BoxesResponseDto) => boolean,
  updater: (it: BoxesResponseDto) => BoxesResponseDto
) {
  const caches = qc.getQueriesData<{ items: BoxesResponseDto[] }>({
    queryKey: qkBoxes.lists(),
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

export const useBoxesMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BoxesUpsertDto, "boxesId">
  >({
    mutationFn: createBoxes,
    onMutate: () => showLoading("Registrando nueva caja..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkBoxes.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, BoxesUpsertDto>({
    mutationFn: updateBoxes,
    onMutate: () => showLoading("Actualizando caja..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.boxesId) {

          patchBoxesListsAfterUpdate(
            qc,
            (it) => it.boxesId === vars.boxesId,
            (it) => ({
              ...it,
              description: vars.description ?? it.description,
              currencyId: vars.currencyId ?? it.currencyId,

            })
          );

          await qc.invalidateQueries({
            queryKey: qkBoxes.byId(vars.boxesId),
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