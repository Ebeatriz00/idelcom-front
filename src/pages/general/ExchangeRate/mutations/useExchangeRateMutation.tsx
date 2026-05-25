import type { 
  ExchangeRateUpsertDto, 
  ExchangeRateResponseDto 
} from "@/application";
import { 
  createExchangeRate, 
  updateExchangeRate 
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkExchangeRate } from "@/sharedKernel/hooks/general/useExchangeRate";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchExchangeRateListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ExchangeRateResponseDto) => boolean,
  updater: (it: ExchangeRateResponseDto) => ExchangeRateResponseDto
) {
  const caches = qc.getQueriesData<{ items: ExchangeRateResponseDto[] }>({
    queryKey: qkExchangeRate.lists(),
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

export const useExchangeRateMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ExchangeRateUpsertDto, "exchangeRateId">
  >({
    mutationFn: createExchangeRate,
    onMutate: () => showLoading("Registrando tipo de cambio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkExchangeRate.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ExchangeRateUpsertDto>({
    mutationFn: updateExchangeRate,
    onMutate: () => showLoading("Actualizando tipo de cambio..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.exchangeRateId) {
          patchExchangeRateListsAfterUpdate(
            qc,
            (it) => it.exchangeRateId === vars.exchangeRateId,
            (it) => ({
              ...it,
              purchaseType: vars.purchaseType,
              saleType: vars.saleType,
              dateFxrate: vars.dateFxrate,
            })
          );
          
          await qc.invalidateQueries({
            queryKey: qkExchangeRate.byId(vars.exchangeRateId),
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