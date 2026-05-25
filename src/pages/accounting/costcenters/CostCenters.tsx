import type { CostCentersResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useCostCentersList,
  useCostCentersMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { CostCentersFormModal } from "./components/CostCentersFormModal";
import { CostCentersTable } from "./components/table/CostCentersTable";
import { useCostCentersFormModal } from "./hooks/useCostCentersModal";
import { useAccCostCenterPerms } from "./hooks/contCenter.perms";

export default function CostCenters() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useCostCentersList(
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
  } = useCostCentersFormModal();

  const {

    canCreateCostCenter,
    canEditCostCenter,
    canEditStatusCostCenter,
    canExportCostCenter,
  } = useAccCostCenterPerms();

  const { statusMut } = useCostCentersMutations();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: CostCentersResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: CostCentersResponseDto) {
    if ( !canEditCostCenter ) return;
    if (row.costCentersId) openEdit(row.costCentersId);
  }

  async function onToggleStatus(row: CostCentersResponseDto) {
    if ( !canEditStatusCostCenter ) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      costCentersId: row.costCentersId,
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
            { label: "Catálogos contables", href: "#" },
            { label: "Centros de Costo", current: true },
          ]}
          createLabel="Nuevo Centro de Costo"
          onCreate={canCreateCostCenter ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <CostCentersTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            search={search}
            onSearchChange={setSearch}
            canExportCostCenter={canExportCostCenter}
            canEditCostCenter={canEditCostCenter}
            canEditStatusCostCenter={canEditStatusCostCenter}
          />
        </AsyncState>
      </section>

      <CostCentersFormModal
        open={open}
        title={editingId ? "Editar Centro de Costo" : "Nuevo Centro de Costo"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
