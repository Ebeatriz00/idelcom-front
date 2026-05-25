import type { CurrencyUpsertDto, CurrencyResponseDto } from "@/application";
import { createCurrency, updateCurrency } from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkCurrency } from "@/sharedKernel/hooks/general/useCurrency";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchCurrencyListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: CurrencyResponseDto) => boolean,
  updater: (it: CurrencyResponseDto) => CurrencyResponseDto
) {
  const caches = qc.getQueriesData<{ items: CurrencyResponseDto[] }>({
    queryKey: qkCurrency.lists(),
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

export const useCurrencyMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CurrencyUpsertDto, "currencyId">
  >({
    mutationFn: createCurrency,
    onMutate: () => showLoading("Registrando nueva moneda..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkCurrency.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, CurrencyUpsertDto>({
    mutationFn: updateCurrency,
    onMutate: () => showLoading("Actualizando moneda..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.currencyId) {
         
          patchCurrencyListsAfterUpdate(
            qc,
            (it) => it.currencyId === vars.currencyId,
            (it) => ({
              ...it,
              description: vars.description,
              code: vars.code,
              codeSunat: vars.codeSunat,
              symbol: vars.symbol,
            })
          );
         
          await qc.invalidateQueries({
            queryKey: qkCurrency.byId(vars.currencyId),
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