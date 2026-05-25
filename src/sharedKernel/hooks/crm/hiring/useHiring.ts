import type { HiringResponseDto, HiringUpdateStatusDto, Paginated } from "@/application";
import { fetchHiringList, markOpportunityFilesRead, updateHiringStatus } from "@/infrastructure";
import { useHiringPerms } from "@/pages/crm/Hiring/hooks/hiring.perms";
import { closeAlert, showApiError, showSuccess, type GlobalResponse } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkHiring = {
  all: ["hiring"] as const,
  lists: () => [...qkHiring.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
    usersId?: number
  ) =>
    [...qkHiring.lists(), pageIndex, pageSize, search ?? "", usersKey, usersId] as const,

  selects: () => [...qkHiring.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkHiring.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkHiring.all, "by-id", id] as const,
};

export function useHiringList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();
  const { canViewAllOpporHiring, isLoadingPerms } = useHiringPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;
  const usersId = useAuth((s) => s.userId);
  const usersBy: number | undefined = canViewAllOpporHiring
    ? undefined
    : workerId ?? undefined;
  const workerKeyPart: string = canViewAllOpporHiring
    ? "all"
    : workerIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewAllOpporHiring || !!workerId);

  return useQuery<Paginated<HiringResponseDto>>({
    queryKey: qkHiring.list(pageIndex, pageSize, s, workerKeyPart, Number(usersId)),
    queryFn: () => fetchHiringList(pageIndex + 1, pageSize, s, usersBy, Number(usersId)),
    retry: false,
    placeholderData: (prev) => prev,
    // refetchInterval: 15000, // ---> ms = 10 * 10 * 10
    staleTime: 60_000,
    enabled,
  });
}



export function useHiringMutations() {
  const qc = useQueryClient();

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<HiringUpdateStatusDto, "businessId" | "usersBy">
  >({
    mutationFn: updateHiringStatus,
    onSuccess: async (res, vars) => {
      closeAlert();

      if (res.status === 1) {
        await showSuccess("Éxito", res.message || "Estado actualizado correctamente.");

        await qc.invalidateQueries({
          queryKey: qkHiring.lists(),
          refetchType: "active",
        });

        if (vars.hiringId) {
          await qc.invalidateQueries({
            queryKey: qkHiring.byId(vars.hiringId),
            refetchType: "active",
          });
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error de conexión al cambiar estado.");
    },
  });

  return { statusMut };
}

export function useMarkOppFilesRead() {
  const qc = useQueryClient();

  return useMutation<void, unknown, { opporToken: string }>({
    mutationFn: ({ opporToken }) => markOpportunityFilesRead(opporToken),
    
    onSuccess: (_, { opporToken }) => {
      qc.setQueriesData<{ items: any[] }>( 
        { queryKey: qkHiring.lists() }, 

        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((o) =>
              o.linkToken === opporToken 
                ? { ...o, unreadFilesCount: 0 } 
                : o,
            ),
          };
        },
      );
    },
  });
}