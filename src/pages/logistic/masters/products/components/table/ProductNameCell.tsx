import type { ProductsResponseDto } from "@/application";
import { statusToBool } from "@/sharedKernel";
import { ProductAvatar, ProductStatusBadge } from "./ProductBadges";

type ProductNameCellProps = {
  product: ProductsResponseDto;
};

export function ProductNameCell({ product }: ProductNameCellProps) {
  const isActive = statusToBool(product.status);
  const sku = product.sku?.trim();
  const barcode = product.barcode?.trim();

  return (
    <div className="flex min-w-[360px] items-center gap-3">
      <ProductAvatar label={product.description} />
      <div className="min-w-0">
        <p
          className="whitespace-normal text-sm font-semibold leading-5 text-secondary"
          title={product.description}
        >
          {product.description || "Producto sin descripcion"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <ProductStatusBadge active={isActive} />
          {sku && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-slate-600">
              SKU: {sku}
            </span>
          )}
          {!sku && barcode && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Cod: {barcode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
