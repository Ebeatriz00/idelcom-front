import { useEffect, useState } from "react";

import type { BankResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useBankList,
  useBankMutations,
} from "@/sharedKernel/hooks/finance/useBank";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { BankFormModal } from "./components/BankFormModal";
import { BankTable } from "./components/table/BankTable";
import { useFinBankPerms } from "./hooks/bank.perms";
import { useBankFormModal } from "./hooks/useBankFormModal";

export default function Bank() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useBankList(
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
  } = useBankFormModal();

  const {
    canCreateBank,
    canEditBank,
    canEditStatusBank,
    canDeleteBank,
    canExportBank,
  } = useFinBankPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useBankMutations();

  const rows: BankResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: BankResponseDto) {
    if (!canEditBank) return;
    openEdit(row);
  }

  async function onToggleStatus(row: BankResponseDto) {
    if (!canEditStatusBank) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      bankId: row.bankId,
      status: boolToStatusString(!currentStatus),
    });
  }
  async function onDelete(_row: BankResponseDto) {
    if (!canDeleteBank) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando bancos… {}
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Configuración", href: "#" },
            { label: "Bancos", current: true },
          ]}
          createLabel="Nuevo Banco"
          onCreate={canCreateBank ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <BankTable
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
            canExportBank={canExportBank}
            canEditBank={canEditBank}
            canEditStatusBank={canEditStatusBank}
          />
        </AsyncState>
      </section>

      {}
      <BankFormModal
        open={open}
        title={editingId ? "Editar Banco" : "Nuevo Banco"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
