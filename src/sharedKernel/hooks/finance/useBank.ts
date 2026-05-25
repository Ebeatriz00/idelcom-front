import type {
  Paginated,
  BankUpsertDto,
  BankResponseDto,
  BankStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createBank,
  fetchBankById,
  fetchBankList,
  fetchBankSelect,
  updateBank,
  updateBankStatus,
} from "@/infrastructure";
import { useFinBankPerms } from "@/pages/finance/bank/hooks/bank.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkBank = {
  all: ["bank"] as const,
  lists: () => [...qkBank.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkBank.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,
  
  selects: () => [...qkBank.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkBank.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkBank.all, "by-id", id] as const,
};

export function useBankOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkBank.select(page, s, pageSize),
    queryFn: () => fetchBankSelect(page, s, pageSize), 
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}


function patchBankListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: BankResponseDto) => boolean,
  updater: (it: BankResponseDto) => BankResponseDto
) {
  const caches = qc.getQueriesData<{ items: BankResponseDto[] }>({
    queryKey: qkBank.lists(),
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


export function useBankList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllBank, isLoadingPerms} = useFinBankPerms();
  const userIdStr = useAuth((s) => s.userId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllBank
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllBank ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllBank || !!userId);  



  return useQuery<Paginated<BankResponseDto>>({
    queryKey: qkBank.list(pageIndex, pageSize, s, usersKeyPart), 
    queryFn: () => fetchBankList(pageIndex + 1, pageSize, s, usersBy), 
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useBankById(id?: number | null) {
  return useQuery<BankResponseDto>({
    queryKey: id != null ? qkBank.byId(id) : qkBank.byId(-1),
    queryFn: () => fetchBankById(id as number), 
    enabled: id != null,
  });
}

export function useBankMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BankUpsertDto, "bankId">
  >({
    mutationFn: createBank,
    onMutate: () => showLoading("Registrando nuevo banco..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        
        await qc.invalidateQueries({
          queryKey: qkBank.all, 
          type: "active", 
        });

        await showSuccess("Éxito", res.message);
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


  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    BankUpsertDto
  >({
    mutationFn: updateBank, 
    onMutate: () => showLoading("Actualizando banco..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        
        if (vars.bankId) {
          
          
          patchBankListsAfterUpdate( 
            qc,
            (it) => it.bankId === vars.bankId,
            (it) => ({
              ...it,
              description: vars.description,
              abrv: vars.abrv, 
            })
          );
          

          await qc.invalidateQueries({
            queryKey: qkBank.byId(vars.bankId), 
          });
        }
        
  
        await qc.invalidateQueries({
            queryKey: qkBank.all, 
            type: "active",
        });

        await showSuccess("Éxito", res.message);
        
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


  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    BankStatusDto
  >({
    mutationFn: updateBankStatus,
    onMutate: (vars) => showLoading(
      vars.status === "1" ? "Activando banco..." : "Desactivando banco..." 
    ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        
        await qc.invalidateQueries({
          queryKey: qkBank.all, 
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
