import { useEffect, useState } from "react";

import type { CurrencyResponseDto } from "@/application";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useCurrencyList,
  useCurrencyMutations,
} from "@/sharedKernel/hooks/general/useCurrency";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { CurrencyFormModal } from "./components/CurrencyFormModal";
import { CurrencyTable } from "./components/table/CurrencyTable";
import { useGeneralCurrencyPerms } from "./hooks/currency.perms";
import { useCurrencyFormModal } from "./hooks/useCurrencyModal";

export default function Currency() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useCurrencyList(
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
  } = useCurrencyFormModal();

  const {
    canCreateCurrency,
    canEditCurrency,
    canEditStatusCurrency,
    canDeleteCurrency,
    canExportCurrency,
  } = useGeneralCurrencyPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useCurrencyMutations();

  const rows: CurrencyResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: CurrencyResponseDto) {
    if (!canEditCurrency) return;
    if (row.currencyId) openEdit(row.currencyId);
  }

  async function onToggleStatus(row: CurrencyResponseDto) {
    if (!canEditStatusCurrency) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      currencyId: row.currencyId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: CurrencyResponseDto) {
    if (!canDeleteCurrency) return;
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
            { label: "Monedas", current: true },
          ]}
          createLabel="Nueva moneda"
          onCreate={canCreateCurrency ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <CurrencyTable
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
            canEditCurrency={canEditCurrency}
            canEditStatusCurrency={canEditStatusCurrency}
            canExportCurrency={canExportCurrency}
          />
        </AsyncState>
      </section>

      <CurrencyFormModal
        open={open}
        title={editingId ? "Editar moneda" : "Nueva moneda"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
