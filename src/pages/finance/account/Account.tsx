import type { AccountResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useAccountList,
  useAccountMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { AccountTable } from "./components/table/AccountTable";

import { AccountFormModal } from "./components/AccountFormModal";
import { useFinTreaAccountsPerms } from "./hooks/account.perms";
import { useAccountFormModal } from "./hooks/useAccountFormModal";

export default function Account() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useAccountList(
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
    detail,
  } = useAccountFormModal();

  const {
    canCreateTreaAccounts,
    canEditTreaAccounts,
    canEditStatusTreaAccounts,
    canExportTreaAccounts,
  } = useFinTreaAccountsPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useAccountMutations();

  const rows: AccountResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: AccountResponseDto) {
    if (!canEditTreaAccounts) return;
    if (row.accountId) openEdit(row.accountId);
  }

  async function onToggleStatus(row: AccountResponseDto) {
    if (!canEditStatusTreaAccounts) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      accountId: row.accountId,
      status: boolToStatusString(!current),
    });
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
            { label: "Tesorería", href: "#" },
            { label: "Cuentas", current: true },
          ]}
          createLabel="Nueva Cuenta"
          onCreate={canCreateTreaAccounts ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <AccountTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canEditTreaAccounts={canEditTreaAccounts}
            canEditStatusTreaAccounts={canEditStatusTreaAccounts}
            canExportTreaAccounts={canExportTreaAccounts}
          />
        </AsyncState>
      </section>

      <AccountFormModal
        open={open}
        title={editingId ? "Editar Cuenta" : "Nueva Cuenta"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        currencyLabel={detail?.currencyDescription}
        bankLabel={detail?.bankDescription}
        accountPlanLabel={detail?.accountPlanDescription}
      />
    </div>
  );
}
