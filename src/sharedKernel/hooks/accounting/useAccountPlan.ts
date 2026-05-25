import type {
  AccountPlanByIdDto,
  AccountPlanResponseDto,
  AccountPlanStatusDto,
  AccountPlanUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createAccountPlan,
  fetchAccountPlanById,
  fetchAccountPlanList,
  fetchAccountPlanSelect,
  updateAccountPlan,
  updateAccountPlanStatus,
} from "@/infrastructure";
import { useAccPlanPerms } from "@/pages/accounting/account-plan/hooks/accPlan.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkAccountPlan = {
  all: ["account-plan"] as const,
  lists: () => [...qkAccountPlan.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkAccountPlan.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkAccountPlan.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAccountPlan.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkAccountPlan.all, "by-id", id] as const,
};

export function useAccountPlanList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllAccPlan, isLoadingPerms} = useAccPlanPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllAccPlan
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllAccPlan ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllAccPlan || !!userId);  

  return useQuery<Paginated<AccountPlanResponseDto>>({
    queryKey: qkAccountPlan.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchAccountPlanList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useAccountPlanOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAccountPlan.select(page, s, pageSize),
    queryFn: () => fetchAccountPlanSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useAccountPlanById(id?: number | null) {
  return useQuery<AccountPlanByIdDto>({
    queryKey: id != null ? qkAccountPlan.byId(id) : qkAccountPlan.byId(-1),
    queryFn: () => fetchAccountPlanById(id as number),
    enabled: id != null,
  });
}

export function useAccountPlanMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<AccountPlanUpsertDto, "accountPlanId">
  >({
    mutationFn: createAccountPlan,
    onMutate: () => showLoading("Creando plan de cuenta..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkAccountPlan.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la plan de cuenta."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando plan de cuenta.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, AccountPlanUpsertDto>({
    mutationFn: updateAccountPlan,
    onMutate: () => showLoading("Actualizando plan de cuenta..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkAccountPlan.lists() }),
          vars.accountPlanId
            ? qc.invalidateQueries({
                queryKey: qkAccountPlan.byId(vars.accountPlanId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la plan de cuenta."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando plan de cuenta.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, AccountPlanStatusDto>({
    mutationFn: updateAccountPlanStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkAccountPlan.lists(),
            refetchType: "active",
          }),
          vars.accountPlanId
            ? qc.invalidateQueries({
                queryKey: qkAccountPlan.byId(vars.accountPlanId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}
