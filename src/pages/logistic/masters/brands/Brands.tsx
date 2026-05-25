import { useEffect, useState } from "react";

import type { BrandsResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useBrandsList,
  useBrandsMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { BrandsTable } from "./components/table/BrandsTable";
import { useMassBrandsPerms } from "./hooks/brands.perms";
import { useBrandsFormModal } from "./hooks/useBrandsFormModal";
import { BrandsFormModal } from "./components/modal/BrandsFormModal";

export default function Brands() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useBrandsList(
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
  } = useBrandsFormModal();

  const {
    canCreateBrands,
    canEditBrands,
    canEditStatusBrands,
    canDeleteBrands,
    canExportBrands,
  } = useMassBrandsPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useBrandsMutations();

  const rows: BrandsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: BrandsResponseDto) {
    if (!canEditBrands) return;
    openEdit(row.brandsId);
  }

  async function onToggleStatus(row: BrandsResponseDto) {
    if (!canEditStatusBrands) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      brandsId: row.brandsId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: BrandsResponseDto) {
    if (!canDeleteBrands) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando marcas…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Catálogos", href: "#" },
            { label: "Marcas", current: true },
          ]}
          createLabel="Nueva Marca"
          onCreate={canCreateBrands ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <BrandsTable
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
            canExportBrands={canExportBrands}
            canEditBrands={canEditBrands}
            canEditStatusBrands={canEditStatusBrands}
          />
        </AsyncState>
      </section>

      {}
      <BrandsFormModal
        open={open}
        title={editingId ? "Editar Marca" : "Nueva Marca"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
