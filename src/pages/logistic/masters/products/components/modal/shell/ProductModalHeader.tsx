import { Package } from "lucide-react";

type ProductModalHeaderProps = {
  title: string;
};

export function ProductModalHeader({ title }: ProductModalHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-secondary p-2 text-white">
        <Package className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span>{title}</span>
          <span className="rounded-full bg-primary-degrad px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
            Logistica
          </span>
        </div>
        <p className="mt-1 text-sm font-normal text-gray-500">
          Catalogo maestro para clasificacion, inventario y gestion logistica de productos.
        </p>
      </div>
    </div>
  );
}

