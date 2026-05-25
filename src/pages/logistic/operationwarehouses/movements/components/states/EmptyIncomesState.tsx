import { Warehouse } from "lucide-react";
import type { EmptyIncomesStateProps } from "../../types/income.types";

export function EmptyIncomesState({ hasRows, loading }: EmptyIncomesStateProps) {
  if (loading || hasRows) return null;

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <Warehouse className="mx-auto mb-3 size-10 text-slate-300" />
      <p className="text-sm font-bold text-slate-700">
        No hay ingresos para los filtros seleccionados.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Registre un nuevo ingreso o ajuste los filtros.
      </p>
    </div>
  );
}
