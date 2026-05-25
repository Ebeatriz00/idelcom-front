import type { AvailableStockDto, ProductsResponseDto } from "@/application";
import { useDebouncedValue } from "@/sharedKernel";
import { useProductsList } from "@/sharedKernel/hooks/logistic/masters/useProducts";
import { useAvailableStock } from "@/sharedKernel/hooks/logistic/operationsWarehouses/useWarehousesMovement";
import { Barcode, Boxes, Check, Loader2, PackageSearch, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ProductSearchPickerProps } from "../../types/income.types";
import { money, numberText } from "../../utils/formatters";

function stockByProduct(items?: AvailableStockDto[]) {
  return new Map((items ?? []).map((item) => [item.productsId, item]));
}

export function ProductSearchPicker({
  value,
  warehouseId,
  error,
  onChange,
}: ProductSearchPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const productsQuery = useProductsList(0, 8, debouncedSearch);
  const stockQuery = useAvailableStock(warehouseId, undefined, debouncedSearch, {
    enabled: Boolean(warehouseId),
  });

  const stockMap = useMemo(
    () => stockByProduct(stockQuery.data),
    [stockQuery.data],
  );
  const products = productsQuery.data?.items ?? [];
  const isLoading = productsQuery.isFetching || stockQuery.isFetching;

  function selectProduct(product: ProductsResponseDto) {
    const id = product.productsId ?? 0;
    const stock = stockMap.get(id);

    onChange({
      productsId: id,
      productLabel: product.description ?? product.shortDescription ?? "",
      sku: product.sku,
      barcode: product.barcode,
      partNum: product.partNum,
      brand: product.brandsDescription,
      productType: product.typesDescription,
      currentStock: stock?.availableQuantity ?? 0,
      averageCost: stock?.averageCost ?? 0,
      lastCost: stock?.lastCost ?? 0,
      manageLots: product.manageLots,
      manageSerials: product.manegesSerials,
      expirationControl: product.expirationControl,
    });
    setSearch("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        className={[
          "rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-primary/15",
          error
            ? "border-red-300"
            : "border-secondary/15 focus-within:border-primary/50",
        ].join(" ")}
      >
        {value?.productsId ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
          >
            <div className="mt-0.5 rounded-lg bg-primary-degrad p-2 text-primary">
              <Boxes className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-secondary">
                {value.productLabel}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>SKU: {value.sku || "sin SKU"}</span>
                <span>Marca: {value.brand || "sin marca"}</span>
                <span>Stock: {numberText(value.currentStock)}</span>
                <span>Ult. costo: {money(value.lastCost)}</span>
              </p>
            </div>
          </button>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpen(true);
              }}
              placeholder="Buscar producto por descripcion, SKU, codigo o parte"
              className="h-11 w-full rounded-xl bg-transparent pl-9 pr-3 text-sm text-secondary outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Cerrar busqueda de producto"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-xl">
            {value?.productsId ? (
              <div className="border-b border-secondary/10 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={search}
                    autoFocus
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cambiar producto..."
                    className="h-10 w-full rounded-lg border border-secondary/15 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>
            ) : null}

            <div className="max-h-80 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Buscando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <PackageSearch className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-secondary">
                    Sin resultados
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Intenta con descripcion, SKU, codigo de barras o numero de parte.
                  </p>
                </div>
              ) : (
                products.map((product) => {
                  const id = product.productsId ?? 0;
                  const selected = value?.productsId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-degrad/70"
                    >
                      <div className="mt-0.5 rounded-lg bg-muted p-2 text-secondary">
                        <Boxes className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-semibold text-secondary">
                            {product.description ?? product.shortDescription ?? "Producto sin descripcion"}
                          </p>
                          {selected ? (
                            <Check className="size-4 shrink-0 text-accent" />
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>SKU: {product.sku || "-"}</span>
                          <span>Marca: {product.brandsDescription || "-"}</span>
                          <span>Tipo: {product.typesDescription || "-"}</span>
                          <span className="inline-flex items-center gap-1">
                            <Barcode className="size-3" />
                            {product.barcode || product.partNum || "-"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
