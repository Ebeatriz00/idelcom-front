import { Plus, Warehouse } from "lucide-react";
import type { IncomeHeaderProps } from "../../types/income.types";

export function IncomeHeader({ onCreate }: IncomeHeaderProps) {
  return (
    <section className="rounded-lg border border-secondary/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary p-2 text-white">
            <Warehouse className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Operaciones de almacen
            </p>
            <h1 className="text-2xl font-semibold text-secondary">
              Ingresos de almacen
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              Entradas de almacen registradas con operacion INGRESO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
          >
            <Plus className="size-4" />
            Nuevo ingreso
          </button>
        </div>
      </div>
    </section>
  );
}
