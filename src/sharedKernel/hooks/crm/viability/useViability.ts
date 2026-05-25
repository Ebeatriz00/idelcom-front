import type { Paginated } from "@/application";
import type {
  Viability,
  ViabilityDecision,
  ViabilityStatus,
} from "@/application/dtos/crm/viability/Viability.dto";
import { CacheController } from "@/cache/cacheController";

import {
  fetchViabilityList,
  processViabilityDecision,
  updateViabilityStatus,
} from "@/infrastructure/api-clients/crm/viability/viability.client";

import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkViability = {
  all: ["viability"] as const,
  lists: () => [...qkViability.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
  ) =>
    [
      ...qkViability.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      usersKey,
    ] as const,
};

export function useViabilityList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const canViewAll = true;

  const usersBy: number | undefined = canViewAll
    ? undefined
    : (workerId ?? undefined);

  const usersKeyPart: string = canViewAll ? "all" : (workerIdStr ?? "all");

  return useQuery<Paginated<Viability>>({
    queryKey: qkViability.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchViabilityList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useViabilityMutations() {
  const qc = useQueryClient();

  type StatusVars = Omit<ViabilityStatus, "businessId" | "usersBy">;

  const statusMut = useMutation<GlobalResponse, unknown, StatusVars>({
    mutationFn: updateViabilityStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando oportunidad..."
          : "Desactivando oportunidad...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkViability.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  type DecisionVars = Omit<ViabilityDecision, "businessId" | "usersBy">;

  const decisionMut = useMutation<GlobalResponse, unknown, DecisionVars>({
    mutationFn: processViabilityDecision,
    onMutate: (vars) =>
      showLoading(
        vars.isApproved
          ? "Aprobando y convirtiendo..."
          : "Rechazando oportunidad...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkViability.all,
        });
        await CacheController.invalidate("opportunities");
        await showSuccess("Procesado", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo procesar la decisión.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al procesar la decisión.");
    },
  });

  return { statusMut, decisionMut };
}
