import type { TaxAffTypeResponseDto, TaxAffTypeUpsertDto } from "@/application";
import { createTaxAffType, updateTaxAffType } from "@/infrastructure";
import {
  closeAlert,
  qkTaxAffType,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchTaxAffTypeListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: TaxAffTypeResponseDto) => boolean,
  updater: (it: TaxAffTypeResponseDto) => TaxAffTypeResponseDto
) {
  const caches = qc.getQueriesData<{ items: TaxAffTypeResponseDto[] }>({
    queryKey: qkTaxAffType.lists(),
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

export const useTaxAffTypeMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<TaxAffTypeUpsertDto, "taxAffTypeId">
  >({
    mutationFn: createTaxAffType,
    onMutate: () =>
      showLoading("Registrando nueva tipo de afectación tributaria..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkTaxAffType.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, TaxAffTypeUpsertDto>({
    mutationFn: updateTaxAffType,
    onMutate: () =>
      showLoading("Actualizando tipo de afectación tributaria..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.taxAffTypeId) {
          patchTaxAffTypeListsAfterUpdate(
            qc,
            (it) => it.taxAffTypeId === vars.taxAffTypeId,
            (it) => ({
              ...it,
              description: vars.description,
              code: vars.code,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkTaxAffType.byId(vars.taxAffTypeId),
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
