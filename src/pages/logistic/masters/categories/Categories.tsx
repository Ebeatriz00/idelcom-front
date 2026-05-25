import type { CategoriesResponseDto } from "@/application";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useCategoriesList,
  useCategoriesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useCategories";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { useEffect, useState } from "react";
import { CategoriesFormModal } from "./components/modal/CategoriesFormModal";
import { CategoriesTable } from "./components/table/CategoriesTable";
import { useMassCategoriesPerms } from "./hooks/categ.perms";
import { useCategoriesFormModal } from "./hooks/useCategoriesFormModal";

export default function Categories() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useCategoriesList(
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
  } = useCategoriesFormModal();

  const {
    canCreateCategories,
    canEditCategories,
    canEditStatusCategories,
    canDeleteCategories,
    canExportCategories,
  } = useMassCategoriesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useCategoriesMutations();

  const rows: CategoriesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: CategoriesResponseDto) {
    if (!canEditCategories) return;
    openEdit(row.categoriesId);
  }

  async function onToggleStatus(row: CategoriesResponseDto) {
    if (!canEditStatusCategories) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      categoriesId: row.categoriesId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: CategoriesResponseDto) {
    if (!canDeleteCategories) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando categorías…
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
            { label: "Categorías", current: true },
          ]}
          createLabel="Nueva Categoría"
          onCreate={canCreateCategories ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <CategoriesTable
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
            canExportCategories={canExportCategories}
            canEditCategories={canEditCategories}
            canEditStatusCategories={canEditStatusCategories}
          />
        </AsyncState>
      </section>

      {}
      <CategoriesFormModal
        open={open}
        title={editingId ? "Editar Categoría" : "Nueva Categoría"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
