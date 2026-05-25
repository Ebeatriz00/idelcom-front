import type {
  Paginated,
  PurchaseOrderApproveDto,
  PurchaseOrderAttachInvoiceDto,
  PurchaseOrderCancelDto,
  PurchaseOrderCreateFromInvoiceDto,
  PurchaseOrderGetByIdResponse,
  PurchaseOrderListFilterDto,
  PurchaseOrderResponseDto,
  PurchaseOrderSendForApprovalDto,
  PurchaseOrderUpsertDto,
} from "@/application";
import {
  approvePurchaseOrder,
  attachPurchaseOrderInvoice,
  cancelPurchaseOrder,
  createPurchaseOrder,
  createPurchaseOrderFromInvoice,
  fetchPurchaseOrderById,
  fetchPurchaseOrderList,
  sendPurchaseOrderForApproval,
  updatePurchaseOrder,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkPurchaseOrder } from "../keys/qk.PurchaseOrder";

type CreateDto = Omit<PurchaseOrderUpsertDto, "purchaseOrderId">;
type UpdateDto = Required<Pick<PurchaseOrderUpsertDto, "purchaseOrderId">> &
  Omit<PurchaseOrderUpsertDto, "purchaseOrderId">;

export function usePurchaseOrderList(filter: PurchaseOrderListFilterDto) {
  return useQuery<Paginated<PurchaseOrderResponseDto>>({
    queryKey: qkPurchaseOrder.list(filter),
    queryFn: () => fetchPurchaseOrderList(filter),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePurchaseOrderById(id?: number | null) {
  return useQuery<PurchaseOrderGetByIdResponse>({
    queryKey: id != null ? qkPurchaseOrder.detail(id) : qkPurchaseOrder.detail(-1),
    queryFn: () => fetchPurchaseOrderById(id as number),
    retry: false,
    enabled: id != null,
  });
}

export function usePurchaseOrderMutations() {
  const qc = useQueryClient();

  const invalidateLists = () =>
    qc.invalidateQueries({ queryKey: qkPurchaseOrder.lists(), exact: false });

  const invalidateDetail = (id?: number | null) =>
    id != null
      ? qc.invalidateQueries({ queryKey: qkPurchaseOrder.detail(id) })
      : Promise.resolve();

  const createMut = useMutation<GlobalResponse, unknown, CreateDto>({
    mutationFn: createPurchaseOrder,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateLists();
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la orden de compra.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando orden de compra.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, UpdateDto>({
    mutationFn: updatePurchaseOrder,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([invalidateLists(), invalidateDetail(vars.purchaseOrderId)]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la orden de compra.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando orden de compra.");
    },
  });

  const approveMut = useMutation<GlobalResponse, unknown, PurchaseOrderApproveDto>({
    mutationFn: approvePurchaseOrder,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([invalidateLists(), invalidateDetail(vars.purchaseOrderId)]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo aprobar la orden de compra.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error aprobando orden de compra.");
    },
  });

  const sendForApprovalMut = useMutation<
    GlobalResponse,
    unknown,
    PurchaseOrderSendForApprovalDto
  >({
    mutationFn: sendPurchaseOrderForApproval,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([invalidateLists(), invalidateDetail(vars.purchaseOrderId)]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo enviar la orden a aprobación.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error enviando orden a aprobación.");
    },
  });

  const cancelMut = useMutation<GlobalResponse, unknown, PurchaseOrderCancelDto>({
    mutationFn: cancelPurchaseOrder,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([invalidateLists(), invalidateDetail(vars.purchaseOrderId)]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo anular la orden de compra.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error anulando orden de compra.");
    },
  });

  const attachInvoiceMut = useMutation<
    GlobalResponse,
    unknown,
    PurchaseOrderAttachInvoiceDto
  >({
    mutationFn: attachPurchaseOrderInvoice,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([invalidateLists(), invalidateDetail(vars.purchaseOrderId)]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo adjuntar la factura.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error adjuntando factura.");
    },
  });

  const createFromInvoiceMut = useMutation<
    GlobalResponse,
    unknown,
    PurchaseOrderCreateFromInvoiceDto
  >({
    mutationFn: createPurchaseOrderFromInvoice,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await invalidateLists();
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la orden desde la factura.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando orden desde factura.");
    },
  });

  return {
    createMut,
    updateMut,
    approveMut,
    sendForApprovalMut,
    cancelMut,
    attachInvoiceMut,
    createFromInvoiceMut,
  };
}
