import type { TaxAffTypeResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useTaxAffTypeList,
  useTaxAffTypeMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { TaxAffTypeFormModal } from "./components/modal/tax-aff-type-form-modal";
import { TaxAffTypeTable } from "./components/table/TaxAffTypeTable";
import { useAccTaxAffPerms } from "./hooks/taxAff.perms";
import { useTaxAffTypeFormModal } from "./hooks/useTaxAffTypeModal";

export default function TaxAffType() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useTaxAffTypeList(
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
  } = useTaxAffTypeFormModal();

  const {
    canCreateTaxAff,
    canEditTaxAff,
    canEditStatusTaxAff,
    canDeleteTaxAff,
    canExportTaxAff,
  } = useAccTaxAffPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useTaxAffTypeMutations();

  const rows: TaxAffTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: TaxAffTypeResponseDto) {
    if (!canEditTaxAff) return;
    if (row.taxAffTypeId) openEdit(row.taxAffTypeId);
  }

  async function onToggleStatus(row: TaxAffTypeResponseDto) {
    if (!canEditStatusTaxAff) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      taxAffTypeId: row.taxAffTypeId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: TaxAffTypeResponseDto) {
    if (!canDeleteTaxAff) return;
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
            { label: "Tipo de Afectación Tributaria", current: true },
          ]}
          createLabel="Nueva comprobante"
          onCreate={canCreateTaxAff ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <TaxAffTypeTable
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
            canEditTaxAff={canEditTaxAff}
            canEditStatusTaxAff={canEditStatusTaxAff}
            canExportTaxAff={canExportTaxAff}
          />
        </AsyncState>
      </section>

      <TaxAffTypeFormModal
        open={open}
        title={editingId ? "Editar" : "Nuevo"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
