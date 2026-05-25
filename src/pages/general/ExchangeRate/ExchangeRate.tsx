import { useEffect, useState } from "react";

import type { ExchangeRateResponseDto } from "@/application";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import {
  useExchangeRateList,
  useExchangeRateMutations,
} from "@/sharedKernel/hooks/general/useExchangeRate";
import { ExchangeRateFormModal } from "./components/ExchangeRateFormModal";
import { ExchangeRateTable } from "./components/table/ExchangeRateTable";
import { useGeneralExChangeRatePerms } from "./hooks/exChangeRate.perms";
import { useExchangeRateFormModal } from "./hooks/useExchangeRateModal";

export default function ExchangeRate() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading, error } = useExchangeRateList(
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
    title,
  } = useExchangeRateFormModal();

  const {
    canCreateExChangeRate,
    canEditExChangeRate,
    canEditStatusExChangeRate,
    canDeleteExChangeRate,
    canExportExChangeRate,
  } = useGeneralExChangeRatePerms();

  const { statusMut } = useExchangeRateMutations();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: ExchangeRateResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ExchangeRateResponseDto) {
    if (!canEditExChangeRate) return;
    if (row.exchangeRateId) openEdit(row.exchangeRateId);
  }

  async function onToggleStatus(row: ExchangeRateResponseDto) {
    if (!canEditStatusExChangeRate) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      exchangeRateId: row.exchangeRateId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ExchangeRateResponseDto) {
    if (!canDeleteExChangeRate) return;
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
            { label: "General", href: "#" },
            { label: "Tipos de Cambio", current: true },
          ]}
          createLabel="Nuevo tipo de cambio"
          onCreate={canCreateExChangeRate ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay undidades de medida registradas."
        >
          <ExchangeRateTable
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
            canEditExChangeRate={canEditExChangeRate}
            canEditStatusExChangeRate={canEditStatusExChangeRate}
            canExportExChangeRate={canExportExChangeRate}
          />
        </AsyncState>
      </section>

      <ExchangeRateFormModal
        open={open}
        title={title}
        loadingDetail={isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
