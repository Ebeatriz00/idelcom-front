import { useEffect, useState } from "react";

import type { WarehousesResponseDto } from "@/application";

import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";

import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import {
  useWarehousesList,
  useWarehousesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useWarehouses";
import { useDebouncedValue } from "@/sharedKernel";
import { WarehousesTable } from "./components/table/WarehousesTable";
import { WarehousesFormModal } from "./components/modal/WarehousesFormModal";
import { useWarehousesFormModal } from "./hooks/useWarehousesFormModal";
import { useMassWHousesPerms } from "./hooks/wHouses.perms";

export default function Warehouses() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useWarehousesList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  );

  const rows: WarehousesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useWarehousesMutations();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

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
  } = useWarehousesFormModal();
  const {
    canCreateWHouses,
    canEditWHouses,
    canEditStatusWHouses,
    canDeleteWHouses,
    canExportWHouses,
  } = useMassWHousesPerms();

  function onEdit(row: WarehousesResponseDto) {
    if (!canEditWHouses) return;
    if (row.warehousesId) openEdit(row.warehousesId);
  }

  async function onToggleStatus(row: WarehousesResponseDto) {
    if (!canEditStatusWHouses) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      warehousesId: row.warehousesId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: WarehousesResponseDto) {
    if (!canDeleteWHouses) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm animate-pulse">
            Cargando…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error cargando los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Logística", href: "#" },
            { label: "Almacenes", current: true },
          ]}
          createLabel="Nuevo almacén"
          onCreate={canCreateWHouses ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <WarehousesTable
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
            canEditWHouses={canEditWHouses}
            canExportWHouses={canExportWHouses}
            canEditStatusWHouses={canEditStatusWHouses}
          />
        </AsyncState>
      </section>

      <WarehousesFormModal
        open={open}
        title={editingId ? "Editar Almacén" : "Nuevo Almacén"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        departmentLabel={defaultValues?.departmentLabel}
        provinceLabel={defaultValues?.provinceLabel}
        districtLabel={defaultValues?.districtLabel}
      />
    </div>
  );
}
