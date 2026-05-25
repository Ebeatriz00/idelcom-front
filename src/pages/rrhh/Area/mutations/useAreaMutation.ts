import type { AreaResponseDto, AreaUpsertDto } from "@/application";
import { createArea, updateArea } from "@/infrastructure";
import {
  closeAlert,
  qkarea,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: AreaResponseDto) => boolean,
  updater: (it: AreaResponseDto) => AreaResponseDto
) {
  const caches = qc.getQueriesData<{ items: AreaResponseDto[] }>({
    queryKey: qkarea.lists(),
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

export const useAreaMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<AreaUpsertDto, "areaId">
  >({
    mutationFn: createArea,
    onMutate: () => showLoading("Registrando nueva área..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkarea.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, AreaUpsertDto>({
    mutationFn: updateArea,
    onMutate: () => showLoading("Actualizando área..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.areaId) {
          patchListsAfterUpdate(
            qc,
            (it) => it.areaId === vars.areaId,
            (it) => ({
              ...it,
              areaId: vars.areaId ?? it.areaId,
              description: vars.description ?? it.description,
              status: it.status,
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
};
