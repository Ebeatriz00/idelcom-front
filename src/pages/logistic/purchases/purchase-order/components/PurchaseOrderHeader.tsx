import { Plus, RefreshCw, ShoppingCart } from "lucide-react";

type Props = {
  isFetching: boolean;
  onRefresh: () => void;
  onCreate: () => void;
};

export function PurchaseOrderHeader({ isFetching, onRefresh, onCreate }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-orange-100 bg-orange-50 p-2 text-orange-700">
              <ShoppingCart className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">
                Órdenes de Compra
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Revisa, filtra y da seguimiento a órdenes de compra de proveedores.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            Actualizar
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nueva Orden
          </button>
        </div>
      </div>
    </section>
  );
}
