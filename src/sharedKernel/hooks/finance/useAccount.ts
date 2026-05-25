import type {
  Paginated,
  AccountUpsertDto,
  AccountResponseDto,
  AccountStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createAccount,
  fetchAccountById,
  fetchAccountList,
  fetchAccountSelect,
  updateAccount,
  updateAccountStatus,
} from "@/infrastructure";
import { useFinTreaAccountsPerms } from "@/pages/finance/account/hooks/account.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkAccount = {
  all: ["account"] as const,
  lists: () => [...qkAccount.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkAccount.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkAccount.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAccount.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkAccount.all, "by-id", id] as const,
};

export function useAccountOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAccount.select(page, s, pageSize),
    queryFn: () => fetchAccountSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useAccountList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllTreaAccounts, isLoadingPerms} = useFinTreaAccountsPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllTreaAccounts
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllTreaAccounts ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllTreaAccounts || !!userId);


  return useQuery<Paginated<AccountResponseDto>>({
    queryKey: qkAccount.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchAccountList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useAccountById(id?: number | null) {
  return useQuery<AccountResponseDto>({
    queryKey: id != null ? qkAccount.byId(id) : qkAccount.byId(-1),
    queryFn: () => fetchAccountById(id as number),
    enabled: id != null,
  });
}

export function useAccountMutations() {
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
        await qc.invalidateQueries({
          queryKey: qkAccount.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
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
    AccountUpsertDto
  >({
    mutationFn: updateAccount,
    onMutate: () => showLoading("Actualizando cuenta..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkAccount.lists() }),
          vars.accountId
            ? qc.invalidateQueries({
                queryKey: qkAccount.byId(vars.accountId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la cuenta."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando cuenta.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    AccountStatusDto
  >({
    mutationFn: updateAccountStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1" ? "Activando cuenta..." : "Desactivando cuenta..."
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkAccount.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}