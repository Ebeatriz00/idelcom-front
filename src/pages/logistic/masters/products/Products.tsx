import type { ProductsResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import {
  useProductsList,
  useProductsMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProducts";
import { useEffect, useState } from "react";
import { ProductsFormModal } from "./components/modal/productsFormModal";
import { ProductFilesModal } from "./components/ProductFilesModal";
import { ProductsTable } from "./components/table/ProductsTable";
import { useProductsFormModal } from "./hooks/useProductsFormModal";

export default function Products() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [productTypeFilter, setProductTypeFilter] = useState<
    number | undefined
  >();
  const [brandFilter, setBrandFilter] = useState<number | undefined>();
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productsId: number;
    description: string;
  } | null>(null);

  const { data, isLoading, error } = useProductsList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    categoryFilter,
    productTypeFilter,
    brandFilter,
  );

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch, categoryFilter, productTypeFilter, brandFilter]);

  const { statusMut } = useProductsMutations();

  const rows: ProductsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

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
  } = useProductsFormModal();

  function onEdit(row: ProductsResponseDto) {
    if (row.productsId) openEdit(row.productsId);
  }

  function handleOpenGallery(row: ProductsResponseDto) {
    if (!row.productsId) return;
    setSelectedProduct({
      productsId: row.productsId,
      description: row.description ?? "",
    });
    setGalleryOpen(true);
  }

  async function onToggleStatus(row: ProductsResponseDto) {
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      productsId: row.productsId ?? undefined,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: ProductsResponseDto) {}

  return (
    <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-12 space-y-4">
        <Breadcrumb
          items={[
            { label: "Almacén", href: "#" },
            { label: "Productos", current: true },
          ]}
          createLabel="Nuevo Producto"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={false}
          emptyMessage="No hay productos registrados."
        >
          <ProductsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onOpenGallery={handleOpenGallery}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            productTypeFilter={productTypeFilter}
            brandFilter={brandFilter}
            onCategoryFilterChange={setCategoryFilter}
            onProductTypeFilterChange={setProductTypeFilter}
            onBrandFilterChange={setBrandFilter}
          />
        </AsyncState>
      </section>

      <ProductsFormModal
        open={open}
        title={editingId ? "Editar Producto" : "Nuevo Producto"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />

      {selectedProduct && (
        <ProductFilesModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          productsId={selectedProduct.productsId}
          productName={selectedProduct.description}
        />
      )}
    </div>
  );
}
