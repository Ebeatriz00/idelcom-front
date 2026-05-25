import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

import type { PurchaseOrderResponseDto } from "@/application";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { confirmAction } from "@/sharedKernel";
import { useSuppliersOptions } from "@/sharedKernel/hooks/logistic/purchases/useSuppliers";
import { useCurrencyOptions } from "@/sharedKernel/hooks/general/useCurrency";
import { usePaymentConditionOptions } from "@/sharedKernel/hooks/accounting/usePmCondition";
import { useWarehousesOptions } from "@/sharedKernel/hooks/logistic/masters/useWarehouses";
import { useProductsOptions } from "@/sharedKernel/hooks/logistic/masters/useProducts";
import { useTaxesOptions } from "@/sharedKernel/hooks/Taxes/useTaxes";
import { usePurchaseOrderById, usePurchaseOrderMutations } from "@/sharedKernel/hooks/logistic/purchases/usePurchaseOrder";
import { useAuth } from "@/stores/auth";
import { selectWorkerId } from "@/stores/auth/selectors";

import {
  PurchaseOrderAuditCard,
  PurchaseOrderDetailHeader,
  PurchaseOrderDocumentsCard,
  PurchaseOrderInfoCard,
  PurchaseOrderLinesTable,
  PurchaseOrderSummaryCard,
  PurchaseOrderTimeline,
} from "./components/detail-view";
import { ApprovePurchaseOrderModal } from "./components/modals/ApprovePurchaseOrderModal";
import { PurchaseOrderDetailLines, PurchaseOrderFormHeader, PurchaseOrderGeneralInfo, PurchaseOrderSummary } from "./components/PurchaseOrderDetailFormSections";
import {
  buildPurchaseOrderUpsertDto,
  calculatePurchaseOrderTotals,
  canSubmitPurchaseOrder,
  findOptionByValue,
  mapPurchaseOrderToFormValues,
} from "./utils/purchaseOrder.helpers";
import { purchaseOrderSchema, type PurchaseOrderFormValues } from "./utils/purchaseOrder.schema";
type Mode = "create" | "edit" | "view";

interface Props {
  mode: Mode;
}

export default function PurchaseOrderDetail({ mode }: Props) {
  const navigate = useNavigate();
  const workerId = useAuth(selectWorkerId);
  const { id } = useParams<{ id: string }>();
  const orderId = id ? Number(id) : undefined;

  const isView = mode === "view";
  const isCreate = mode === "create";

  const { data: existingOrder, isLoading: loadingOrder } = usePurchaseOrderById(
    mode !== "create" ? orderId : null,
  );
  const {
    createMut,
    updateMut,
    approveMut,
    sendForApprovalMut,
  } = usePurchaseOrderMutations();
  const [approveTarget, setApproveTarget] =
    useState<PurchaseOrderResponseDto | null>(null);

  const suppliersQuery = useSuppliersOptions(1, "", 1000);
  const currencyQuery = useCurrencyOptions(1, "", 100);
  const pmConditionQuery = usePaymentConditionOptions(1, "", 100);
  const warehousesQuery = useWarehousesOptions(1, "", 1000);
  const productsQuery = useProductsOptions(1, "", 1000);
  const taxesQuery = useTaxesOptions(1, "", 100);

  const suppliers = suppliersQuery.data?.items ?? [];
  const currencies = currencyQuery.data?.items ?? [];
  const pmConditions = pmConditionQuery.data?.items ?? [];
  const warehouses = warehousesQuery.data?.items ?? [];
  const products = productsQuery.data?.items ?? [];
  const taxes = taxesQuery.data?.items ?? [];

  const today = format(new Date(), "yyyy-MM-dd");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    mode: "onChange",
    defaultValues: {
      suppliersId: 0,
      purchaseOrderDate: today,
      currencyId: 0,
      exchangeRate: 1,
      pmConditionId: 0,
      expectedDeliveryDate: "",
      warehouseId: undefined,
      supplierQuotationReferenceNumber: "",
      references: "",
      observation: "",
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "details" });
  const watchedDetails = useWatch({ control, name: "details" });
  const watchedSuppliersId = useWatch({ control, name: "suppliersId" });
  const watchedCurrencyId = useWatch({ control, name: "currencyId" });
  const watchedPmConditionId = useWatch({ control, name: "pmConditionId" });
  const watchedWarehouseId = useWatch({ control, name: "warehouseId" });
  const details = useMemo(() => watchedDetails ?? [], [watchedDetails]);

  useEffect(() => {
    if (existingOrder && mode !== "create") {
      reset(mapPurchaseOrderToFormValues(existingOrder, today));
    }
  }, [existingOrder, mode, reset, today]);

  const totals = useMemo(
    () => calculatePurchaseOrderTotals(details, taxes),
    [details, taxes],
  );
  const selectedSupplier = useMemo(
    () => findOptionByValue(suppliers, watchedSuppliersId),
    [suppliers, watchedSuppliersId],
  );
  const selectedCurrency = useMemo(
    () => findOptionByValue(currencies, watchedCurrencyId),
    [currencies, watchedCurrencyId],
  );
  const selectedPmCondition = useMemo(
    () => findOptionByValue(pmConditions, watchedPmConditionId),
    [pmConditions, watchedPmConditionId],
  );
  const selectedWarehouse = useMemo(
    () => findOptionByValue(warehouses, watchedWarehouseId),
    [warehouses, watchedWarehouseId],
  );

  const canSubmit = canSubmitPurchaseOrder({
    suppliersId: watchedSuppliersId,
    currencyId: watchedCurrencyId,
    details,
  });

  async function onSubmit(values: PurchaseOrderFormValues) {
    console.log("[PurchaseOrderDetail] submit valid", {
      mode,
      orderId,
      canSubmit,
      values,
    });

    if (!canSubmit) return;

    const dto = buildPurchaseOrderUpsertDto(values);
    console.log("[PurchaseOrderDetail] upsert dto", {
      mode,
      orderId,
      dto,
    });

    if (isCreate) {
      const res = await createMut.mutateAsync(dto);
      const createdId = Number(res.id ?? 0);

      if (res.status === 1 && createdId > 0) {
        const shouldSendForApproval = await confirmAction({
          title: "Enviar a aprobación",
          text: "La orden fue creada como borrador. ¿Deseas enviarla ahora a aprobación?",
          confirmText: "Sí, enviar",
          cancelText: "No, mantener borrador",
          icon: "question",
        });

        if (shouldSendForApproval) {
          await sendForApprovalMut.mutateAsync({ purchaseOrderId: createdId });
        }

        navigate(`/logistic/purchase-order/${createdId}`);
        return;
      }

      navigate("/logistic/purchase-order");
    } else if (orderId) {
      await updateMut.mutateAsync({ ...dto, purchaseOrderId: orderId });
      navigate(`/logistic/purchase-order/${orderId}`);
    }
  }

  function onInvalid(errors: FieldErrors<PurchaseOrderFormValues>) {
    console.log("[PurchaseOrderDetail] submit invalid", {
      mode,
      orderId,
      canSubmit,
      errors,
      values: {
        suppliersId: watchedSuppliersId,
        currencyId: watchedCurrencyId,
        details,
      },
    });
  }

  function asPurchaseOrderRow(): PurchaseOrderResponseDto | null {
    if (!existingOrder) return null;

    return {
      purchaseOrderId: existingOrder.purchaseOrderId,
      purchaseOrderNumber: existingOrder.purchaseOrderNumber,
      purchaseOrderDate: existingOrder.purchaseOrderDate,
      suppliersId: existingOrder.suppliersId,
      supplierName: existingOrder.supplierName,
      supplierDocumentNumber: existingOrder.supplierDocumentNumber,
      currencyId: existingOrder.currencyId,
      currencyDescription: existingOrder.currencyDescription,
      purchaseOrderStatusId: existingOrder.purchaseOrderStatusId,
      statusDescription: existingOrder.statusDescription,
      isRegularization: existingOrder.isRegularization,
      subtotal: existingOrder.subtotal,
      taxAmount: existingOrder.taxAmount,
      total: existingOrder.total,
      expectedDeliveryDate: existingOrder.expectedDeliveryDate,
    };
  }

  async function handleApproveConfirm() {
    if (!approveTarget) return;
    await approveMut.mutateAsync({
      purchaseOrderId: approveTarget.purchaseOrderId,
      approvedBy: Number(workerId ?? 0),
    });
    setApproveTarget(null);
  }

  async function handleRegisterReception() {
    const confirmed = await confirmAction({
      title: "Registrar recepción",
      text: "Se abrirá el módulo de movimientos para registrar la recepción relacionada.",
      confirmText: "Continuar",
      cancelText: "Cancelar",
      icon: "info",
    });

    if (confirmed) navigate("/operations/movements");
  }

  const pageTitle = isCreate
    ? "Nueva Orden de Compra"
    : isView
      ? `Orden #${existingOrder?.purchaseOrderNumber ?? orderId}`
      : `Editar Orden #${existingOrder?.purchaseOrderNumber ?? orderId}`;

  if (loadingOrder && !isCreate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isView && existingOrder) {
    const orderRow = asPurchaseOrderRow();

    return (
      <div className="min-h-[80vh] space-y-4">
        <div className="[&>div]:rounded-lg [&>div]:border-slate-200 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
          <Breadcrumb
            items={[
              { label: "Logística", href: "#" },
              { label: "Compras", href: "#" },
              { label: "Órdenes de Compra", href: "/logistic/purchase-order" },
              {
                label: `Orden #${existingOrder.purchaseOrderNumber ?? orderId}`,
                current: true,
              },
            ]}
          />
        </div>

        <PurchaseOrderDetailHeader
          order={existingOrder}
          approving={approveMut.isPending}
          onBack={() => navigate("/logistic/purchase-order")}
          onApprove={() => orderRow && setApproveTarget(orderRow)}
          onRegisterReception={handleRegisterReception}
          onViewReception={handleRegisterReception}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <PurchaseOrderInfoCard order={existingOrder} />
            <PurchaseOrderLinesTable
              order={existingOrder}
            />
            <PurchaseOrderDocumentsCard order={existingOrder} />
            <PurchaseOrderAuditCard order={existingOrder} />
          </div>

          <div className="xl:col-span-4">
            <div className="space-y-5 xl:sticky xl:top-4">
              <PurchaseOrderSummaryCard order={existingOrder} />
              <PurchaseOrderTimeline order={existingOrder} />
            </div>
          </div>
        </div>

        <ApprovePurchaseOrderModal
          open={approveTarget !== null}
          order={approveTarget}
          saving={approveMut.isPending}
          onClose={() => setApproveTarget(null)}
          onConfirm={handleApproveConfirm}
        />

      </div>
    );
  }

  return (
    <div className="min-h-[80vh] space-y-4">
      <div className="[&>div]:rounded-lg [&>div]:border-slate-200 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
        <Breadcrumb
          items={[
            { label: "Logística", href: "#" },
            { label: "Compras", href: "#" },
            { label: "Órdenes de Compra", href: "/logistic/purchase-order" },
            { label: pageTitle, current: true },
          ]}
        />
      </div>

      <PurchaseOrderFormHeader
        pageTitle={pageTitle}
        isCreate={isCreate}
        existingOrder={existingOrder}
        onBack={() => navigate("/logistic/purchase-order")}
      />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            {!canSubmit && !isView ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Selecciona proveedor, moneda y al menos un producto completo antes de crear la orden.
                </span>
              </div>
            ) : null}

            <PurchaseOrderGeneralInfo
              control={control}
              register={register}
              errors={errors}
              isView={isView}
              existingOrder={existingOrder}
              selectedSupplier={selectedSupplier}
              selectedCurrency={selectedCurrency}
              selectedPmCondition={selectedPmCondition}
              selectedWarehouse={selectedWarehouse}
              watchedCurrencyId={watchedCurrencyId}
            />

            <PurchaseOrderDetailLines
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              fields={fields}
              details={details}
              products={products}
              taxes={taxes}
              currencyId={watchedCurrencyId}
              isView={isView}
              append={append}
              remove={remove}
            />
          </div>

          <div className="xl:col-span-4">
            <PurchaseOrderSummary
              subtotal={totals.subtotal}
              discountTotal={totals.discountTotal}
              taxAmount={totals.taxAmount}
              total={totals.total}
              currencyId={watchedCurrencyId}
              isView={isView}
              isCreate={isCreate}
              isSubmitting={isSubmitting}
              isSaving={createMut.isPending || updateMut.isPending}
              canSubmit={canSubmit}
              hasLines={details.length > 0}
              onCancel={() => navigate("/logistic/purchase-order")}
            />
          </div>
        </div>
      </form>
    </div>
  );
}



