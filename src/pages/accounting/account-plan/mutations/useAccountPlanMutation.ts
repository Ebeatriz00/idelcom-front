import type { AccountPlanByIdDto, AccountPlanUpsertDto } from "@/application";
import { createAccountPlan, updateAccountPlan } from "@/infrastructure";
import {
  closeAlert,
  qkAccountPlan,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchAccountPlanListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: AccountPlanByIdDto) => boolean,
  updater: (it: AccountPlanByIdDto) => AccountPlanByIdDto
) {
  const caches = qc.getQueriesData<{ items: AccountPlanByIdDto[] }>({
    queryKey: qkAccountPlan.lists(),
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

export const useAccountPlanMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<AccountPlanUpsertDto, "AccountPlanId">
  >({
    mutationFn: createAccountPlan,
    onMutate: () =>
      showLoading("Registrando nueva tipo de comprobante de pago..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkAccountPlan.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, AccountPlanUpsertDto>({
    mutationFn: updateAccountPlan,
    onMutate: () => showLoading("Actualizando tipo de comprobante de pago..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.accountPlanId) {
          patchAccountPlanListsAfterUpdate(
            qc,
            (it) => it.accountPlanId === vars.accountPlanId,
            (it) => ({
              ...it,
              accountName: vars.accountName,
              accountTypeId: vars.accountTypeId,
              accountLevelId: vars.accountLevelId,
              typeAnalysisId: vars.typeAnalysisId,
              currencyId: vars.currencyId,
              auxiliaryTypeId: vars.auxiliaryTypeId,
              difereceChange: vars.difereceChange,
              docControl: vars.docControl,
              accountAmarreDebit: vars.accountAmarreDebit,
              accountAmarreCredit: vars.accountAmarreCredit,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkAccountPlan.byId(vars.accountPlanId),
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
