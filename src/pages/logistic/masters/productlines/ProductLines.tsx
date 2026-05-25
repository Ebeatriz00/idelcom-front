import { useEffect, useState } from "react";

import type { ProductLinesResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useProductLinesList,
  useProductLinesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProductLines";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { ProductLinesFormModal } from "./components/modal/ProductLinesFormModal";
import { ProductLinesTable } from "./components/table/ProductLinesTable";
import { useMassProdLinesPerms } from "./hooks/prodLines.perms";
import { useProductLinesFormModal } from "./hooks/useProductLinesFormModal";

export default function ProductLines() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useProductLinesList(
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
  } = useProductLinesFormModal();

  const {
    canCreateProdLines,
    canEditProdLines,
    canEditStatusProdLines,
    canDeleteProdLines,
    canExportProdLines,
  } = useMassProdLinesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useProductLinesMutations();

  const rows: ProductLinesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ProductLinesResponseDto) {
    if (!canEditProdLines) return;
    openEdit(row.productLinesId);
  }

  async function onToggleStatus(row: ProductLinesResponseDto) {
    if (!canEditStatusProdLines) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      productLinesId: row.productLinesId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: ProductLinesResponseDto) {
    if (!canDeleteProdLines) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando líneas de producto…
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
            { label: "Líneas de Producto", current: true },
          ]}
          createLabel="Nueva Línea"
          onCreate={canCreateProdLines ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ProductLinesTable
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
            canEditProdLines={canEditProdLines}
            canExportProdLines={canExportProdLines}
            canEditStatusProdLines={canEditStatusProdLines}
          />
        </AsyncState>
      </section>

      {}
      <ProductLinesFormModal
        open={open}
        title={
          editingId ? "Editar Línea de Producto" : "Nueva Línea de Producto"
        }
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
