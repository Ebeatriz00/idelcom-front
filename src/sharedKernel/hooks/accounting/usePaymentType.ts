import type { OptionItem, PagedSelect, Paginated, PaymentTypeResponseDto, PaymentTypeStatusDto, PaymentTypeUpsertDto } from "@/application";
import { createPaymentType, fetchPaymentTypeById, fetchPaymentTypeList, fetchPaymentTypeSelect, updatePaymentType, updatePaymentTypeStatus } from "@/infrastructure";
import { useAccPayTypePerms } from "@/pages/accounting/documents/hooks/payType.perms";
import { closeAlert, showApiError, showLoading, showSuccess, type GlobalResponse } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkPaymentType = {
  all: ["payment-type"] as const,
  lists: () => [...qkPaymentType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkPaymentType.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkPaymentType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPaymentType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkPaymentType.all, "by-id", id] as const,
};

export function usePaymentTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllPayType, isLoadingPerms} = useAccPayTypePerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllPayType
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllPayType ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllPayType || !!userId);  

  return useQuery<Paginated<PaymentTypeResponseDto>>({
    queryKey: qkPaymentType.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchPaymentTypeList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function usePaymentTypeOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPaymentType.select(page, s, pageSize),
    queryFn: () => fetchPaymentTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function usePaymentTypeById(id?: number | null) {
  return useQuery<PaymentTypeResponseDto>({
    queryKey: id != null ? qkPaymentType.byId(id) : qkPaymentType.byId(-1),
    queryFn: () => fetchPaymentTypeById(id as number),
    enabled: id != null,
  });
}

export function usePaymentTypeMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PaymentTypeUpsertDto, "paymentTypeId">
  >({
    mutationFn: createPaymentType,
    onMutate: () => showLoading("Creando tipo comprobante de pago..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkPaymentType.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la tipo comprobante de pago."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo comprobante de pago.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, PaymentTypeUpsertDto>({
    mutationFn: updatePaymentType,
    onMutate: () => showLoading("Actualizando tipo comprobante de pago..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkPaymentType.lists() }),
          vars.paymentTypeId
            ? qc.invalidateQueries({ queryKey: qkPaymentType.byId(vars.paymentTypeId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tipo comprobante de pago."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo comprobante de pago.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, PaymentTypeStatusDto>({
    mutationFn: updatePaymentTypeStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkPaymentType.lists(),
            refetchType: "active",
          }),
          vars.paymentTypeId
            ? qc.invalidateQueries({
                queryKey: qkPaymentType.byId(vars.paymentTypeId),
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