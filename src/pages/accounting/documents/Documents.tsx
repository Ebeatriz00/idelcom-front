import type { PaymentTypeResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  usePaymentTypeList,
  usePaymentTypeMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { PaymentTypeFormModal } from "./components/modal/PaymentTypeFormModal";
import { PaymentTypeTable } from "./components/table/PaymentTypeTable";
import { useAccPayTypePerms } from "./hooks/payType.perms";
import { usePaymentTypeFormModal } from "./hooks/usePaymentTypeModal";

export default function Documents() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = usePaymentTypeList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  } = usePaymentTypeFormModal();

  const {
    canCreatePayType,
    canEditPayType,
    canEditStatusPayType,
    canDeletePayType,
    canExportPayType,
  } = useAccPayTypePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = usePaymentTypeMutations();

  const rows: PaymentTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: PaymentTypeResponseDto) {
    if (!canEditPayType) return;
    if (row.paymentTypeId) openEdit(row.paymentTypeId);
  }

  async function onToggleStatus(row: PaymentTypeResponseDto) {
    if (!canEditStatusPayType) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      paymentTypeId: row.paymentTypeId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: PaymentTypeResponseDto) {
    if (!canDeletePayType) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error"}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Catálogos contables", href: "#" },
            { label: "Tipo de comprobante", current: true },
          ]}
          createLabel="Nueva comprobante"
          onCreate={canCreatePayType ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <PaymentTypeTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canEditPayType={canEditPayType}
            canEditStatusPayType={canEditStatusPayType}
            canExportPayType={canExportPayType}
          />
        </AsyncState>
      </section>

      <PaymentTypeFormModal
        open={open}
        title={editingId ? "Editar" : "Nueva"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
