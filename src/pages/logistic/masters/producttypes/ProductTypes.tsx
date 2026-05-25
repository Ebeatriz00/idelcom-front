import { useEffect, useState } from "react";

import type { ProductTypesResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useProductTypesList,
  useProductTypesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProductTypes";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { ProductTypesFormModal } from "./components/modal/ProductTypesFormModal";
import { ProductTypesTable } from "./components/table/ProductTypesTable";
import { useMassProdTypePerms } from "./hooks/prodType.perms";
import { useProductTypesFormModal } from "./hooks/useProductTypesFormModal";

export default function ProductTypes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useProductTypesList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
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
  } = useProductTypesFormModal();

  const {
    canCreateProdType,
    canEditProdType,
    canEditStatusProdType,
    canDeleteProdType,
    canExportProdType,
  } = useMassProdTypePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useProductTypesMutations();

  const rows: ProductTypesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ProductTypesResponseDto) {
    if (!canEditProdType) return;
    openEdit(row);
  }

  async function onToggleStatus(row: ProductTypesResponseDto) {
    if (!canEditStatusProdType) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      productTypesId: row.productTypesId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: ProductTypesResponseDto) {
    if (!canDeleteProdType) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando tipos de producto…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Maestro", href: "#" },
            { label: "Tipos de Producto", current: true },
          ]}
          createLabel="Nuevo Tipo"
          onCreate={canCreateProdType ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay registros."
        >
          <ProductTypesTable
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
            canExportProdType={canExportProdType}
            canEditStatusProdType={canEditStatusProdType}
            canEditProdType={canEditProdType}
          />
        </AsyncState>
      </section>

      <ProductTypesFormModal
        open={open}
        title={editingId ? "Editar Tipo de Producto" : "Nuevo Tipo de Producto"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
