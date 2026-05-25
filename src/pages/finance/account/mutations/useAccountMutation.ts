import type { AccountResponseDto, AccountUpsertDto } from "@/application";
import { createAccount, updateAccount } from "@/infrastructure";
import {
  closeAlert,
  qkAccount,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchAccountListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: AccountResponseDto) => boolean,
  updater: (it: AccountResponseDto) => AccountResponseDto
) {
  const caches = qc.getQueriesData<{ items: AccountResponseDto[] }>({
    queryKey: qkAccount.lists(),
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

export const useAccountMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<AccountUpsertDto, "accountId">
  >({
    mutationFn: createAccount,
    onMutate: () => showLoading("Registrando nueva cuenta..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkAccount.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, AccountUpsertDto>({
    mutationFn: updateAccount,
    onMutate: () => showLoading("Actualizando cuenta..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.accountId) {
          patchAccountListsAfterUpdate(
            qc,
            (it) => it.accountId === vars.accountId,
            (it) => ({
              ...it,
              description: vars.description ?? it.description,
              currencyId: vars.currencyId ?? it.currencyId,
              bankId: vars.bankId ?? it.bankId,
              accountPlanId: vars.accountPlanId ?? it.accountPlanId,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkAccount.byId(vars.accountId),
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