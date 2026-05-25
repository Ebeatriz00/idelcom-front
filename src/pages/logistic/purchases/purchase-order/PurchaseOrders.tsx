import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ClipboardList, Plus } from "lucide-react";

import type {
  OptionItem,
  PurchaseOrderListFilterDto,
  PurchaseOrderResponseDto,
} from "@/application";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  usePurchaseOrderList,
  usePurchaseOrderMutations,
} from "@/sharedKernel/hooks/logistic/purchases/usePurchaseOrder";
import { useAuth } from "@/stores/auth";
import { selectWorkerId } from "@/stores/auth/selectors";
import { downloadPurchaseOrderPdf } from "@/infrastructure";

import { ApprovePurchaseOrderModal } from "./components/modals/ApprovePurchaseOrderModal";
import { CancelPurchaseOrderModal } from "./components/modals/CancelPurchaseOrderModal";
import { SendPurchaseOrderForApprovalModal } from "./components/modals/SendPurchaseOrderForApprovalModal";
import { PurchaseOrderFilters } from "./components/PurchaseOrderFilters";
import { PurchaseOrderHeader } from "./components/PurchaseOrderHeader";
import { PurchaseOrderStats } from "./components/PurchaseOrderStats";
import { PurchaseOrderTable } from "./components/table/PurchaseOrderTable";
import {
  openPurchaseOrderPdf,
  toPurchaseOrderDate,
} from "./utils/purchaseOrder.helpers";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const workerId = useAuth(selectWorkerId);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OptionItem | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [approveTarget, setApproveTarget] =
    useState<PurchaseOrderResponseDto | null>(null);
  const [sendForApprovalTarget, setSendForApprovalTarget] =
    useState<PurchaseOrderResponseDto | null>(null);
    
  const [cancelTarget, setCancelTarget] =
    useState<PurchaseOrderResponseDto | null>(null);

  const filter: PurchaseOrderListFilterDto = {
    search: debouncedSearch || undefined,
    purchaseOrderStatusId: status?.value,
    dateFrom: dateFrom ? toPurchaseOrderDate(dateFrom) : undefined,
    dateTo: dateTo ? toPurchaseOrderDate(dateTo) : undefined,
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  };

  const { data, isLoading, isFetching, error, refetch } =
    usePurchaseOrderList(filter);
  const { approveMut, cancelMut, sendForApprovalMut } = usePurchaseOrderMutations();

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function handleView(row: PurchaseOrderResponseDto) {
    navigate(`/logistic/purchase-order/${row.purchaseOrderId}`);
  }

  function handleEdit(row: PurchaseOrderResponseDto) {
    navigate(`/logistic/purchase-order/${row.purchaseOrderId}/edit`);
  }

  async function handlePrint(row: PurchaseOrderResponseDto) {
    const pdf = await downloadPurchaseOrderPdf(row.purchaseOrderId);
    openPurchaseOrderPdf(
      pdf,
      `OC-${row.purchaseOrderNumber ?? row.purchaseOrderId}.pdf`,
    );
  }

  async function handleApproveConfirm() {
    if (!approveTarget) return;
    await approveMut.mutateAsync({
      purchaseOrderId: approveTarget.purchaseOrderId,
      approvedBy: Number(workerId ?? 0),
    });
    setApproveTarget(null);
  }

  async function handleSendForApprovalConfirm() {
    if (!sendForApprovalTarget) return;
    await sendForApprovalMut.mutateAsync({
      purchaseOrderId: sendForApprovalTarget.purchaseOrderId,
    });
    setSendForApprovalTarget(null);
  }

  async function handleCancelConfirm(reason: string) {
    if (!cancelTarget) return;
    await cancelMut.mutateAsync({
      purchaseOrderId: cancelTarget.purchaseOrderId,
      cancelledBy: Number(workerId ?? 0),
      reason,
    });
    setCancelTarget(null);
  }

  function resetPagination() {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }

  function handleClearFilters() {
    setSearch("");
    setStatus(null);
    setDateFrom("");
    setDateTo("");
    resetPagination();
  }

  return (
    <div className="min-h-[80vh] space-y-4">
      <div className="[&>div]:rounded-lg [&>div]:border-slate-200 [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
        <Breadcrumb
          items={[
            { label: "Logística", href: "#" },
            { label: "Compras", href: "#" },
            { label: "Órdenes de Compra", current: true },
          ]}
        />
      </div>

      <PurchaseOrderHeader
        isFetching={isFetching}
        onRefresh={() => refetch()}
        onCreate={() => navigate("/logistic/purchase-order/new")}
      />

      <PurchaseOrderStats rows={rows} total={total} />

      <PurchaseOrderFilters
        search={search}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        total={total}
        onSearchChange={(value) => {
          setSearch(value);
          resetPagination();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetPagination();
        }}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetPagination();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetPagination();
        }}
        onClear={handleClearFilters}
      />

      {error ? (
        <section className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                No se pudieron cargar las órdenes de compra.
              </p>
              <p className="text-rose-700">
                Intenta nuevamente o revisa tu conexión.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-9 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Reintentar
          </button>
        </section>
      ) : rows.length === 0 && !isLoading && !isFetching ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ClipboardList className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-slate-950">
            No se encontraron órdenes de compra
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Ajusta los filtros o registra una nueva orden para iniciar el seguimiento.
          </p>
          <button
            type="button"
            onClick={() => navigate("/logistic/purchase-order/new")}
            className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <Plus className="size-4" aria-hidden="true" />
            Crear nueva orden
          </button>
        </section>
      ) : (
        <PurchaseOrderTable
          data={rows}
          total={total}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          onView={handleView}
          onEdit={handleEdit}
          onSendForApproval={(row) => setSendForApprovalTarget(row)}
          onApprove={(row) => setApproveTarget(row)}
          onPrint={handlePrint}
          onCancel={(row) => setCancelTarget(row)}
          canExport
          loading={isLoading || isFetching}
        />
      )}

      <ApprovePurchaseOrderModal
        open={approveTarget !== null}
        order={approveTarget}
        saving={approveMut.isPending}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />

      <SendPurchaseOrderForApprovalModal
        open={sendForApprovalTarget !== null}
        order={sendForApprovalTarget}
        saving={sendForApprovalMut.isPending}
        onClose={() => setSendForApprovalTarget(null)}
        onConfirm={handleSendForApprovalConfirm}
      />

      <CancelPurchaseOrderModal
        open={cancelTarget !== null}
        order={cancelTarget}
        saving={cancelMut.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

