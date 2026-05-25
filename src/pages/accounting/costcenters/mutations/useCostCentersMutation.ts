import type {
  CostCentersResponseDto,
  CostCentersUpsertDto,
} from "@/application";
import { createCostCenters, updateCostCenters } from "@/infrastructure";
import {
  closeAlert,
  qkCostCenters,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";


function patchCostCentersListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: CostCentersResponseDto) => boolean,
  updater: (it: CostCentersResponseDto) => CostCentersResponseDto
) {
  const caches = qc.getQueriesData<{ items: CostCentersResponseDto[] }>({
    queryKey: qkCostCenters.lists(),
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


export const useCostCentersMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CostCentersUpsertDto, "costCentersId">
  >({
    mutationFn: createCostCenters,
    onMutate: () => showLoading("Registrando nuevo centro de costo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkCostCenters.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, CostCentersUpsertDto>({
    mutationFn: updateCostCenters,
    onMutate: () => showLoading("Actualizando centro de costo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.costCentersId) {
          patchCostCentersListsAfterUpdate(
            qc,
            (it) => it.costCentersId === vars.costCentersId,
            (it) => ({
              ...it,
              description: vars.description,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkCostCenters.byId(vars.costCentersId),
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