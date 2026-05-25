import type { AccountPlanByIdDto, AccountPlanResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useAccountPlanList,
  useAccountPlanMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { AccountPlanFormModal } from "./components/modal/AccountPlanFormModal";
import { AccountPlanTable } from "./components/table/AccountPlanTable";
import { useAccPlanPerms } from "./hooks/accPlan.perms";
import { useAccountPlanFormModal } from "./hooks/useAccountPlan";

export default function AccountPlan() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useAccountPlanList(
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
  } = useAccountPlanFormModal();

  const {
    canCreateAccPlan,
    canEditAccPlan,
    canEditStatusAccPlan,
    canDeleteAccPlan,
    canExportAccPlan,
  } = useAccPlanPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useAccountPlanMutations();

  const rows: AccountPlanResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: AccountPlanByIdDto) {
    if (!canEditAccPlan) return;
    if (row.accountPlanId) openEdit(row.accountPlanId);
  }

  async function onToggleStatus(row: AccountPlanResponseDto) {
    if (!canEditStatusAccPlan) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      accountPlanId: row.accountPlanId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: AccountPlanResponseDto) {
    if (!canDeleteAccPlan) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Catálogos contables", href: "#" },
            { label: "Plan de cuentas", current: true },
          ]}
          createLabel="Nueva comprobante"
          onCreate={canCreateAccPlan ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <AccountPlanTable
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
            canEditAccPlan={canEditAccPlan}
            canExportAccPlan={canExportAccPlan}
            canEditStatusAccPlan={canEditStatusAccPlan}
          />
        </AsyncState>
      </section>
      <AccountPlanFormModal
        open={open}
        title={editingId ? "Editar plan de cuentas" : "Nuevo plan de cuentas"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
