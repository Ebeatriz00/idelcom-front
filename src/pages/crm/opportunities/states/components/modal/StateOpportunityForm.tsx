import type { StateOpportunityUpsertDto } from "@/application";
import { UpperInput } from "@/layouts";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function StatesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: StateOpportunityUpsertDto;
  onSubmit: (dto: StateOpportunityUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [stateOpportunityId, setStateOpportunityId] = useState<
    number | undefined
  >(defaultValues?.stateOpportunityId);
  const [stateColor, setStateColor] = useState(defaultValues?.stateColor);
  const [stateDesc, setStateDesc] = useState(defaultValues?.stateDesc ?? "");
  const [numPercPro, setNumPercPro] = useState<number | undefined>(
    defaultValues?.numPercPro
  );
  const [numOrder, setNumOrder] = useState<number | undefined>(
    defaultValues?.numOrder
  );

  useEffect(() => {
    setStateOpportunityId(defaultValues?.stateOpportunityId);
    setStateColor(defaultValues?.stateColor);
    setStateDesc(defaultValues?.stateDesc ?? "");
    setNumPercPro(defaultValues?.numPercPro);
    setNumOrder(defaultValues?.numOrder);
  }, [defaultValues]);

  const valid = stateDesc.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            stateOpportunityId: stateOpportunityId,
            stateColor: stateColor!,
            stateDesc: stateDesc.trim(),
            numPercPro: numPercPro!,
            numOrder: numOrder!,
          });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descriptcion
        </label>
        <UpperInput
          value={stateDesc}
          onValueChange={setStateDesc}
          placeholder="Ej: COTIZACIÓN"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Color del estado
        </label>
        <select
          value={stateColor}
          onChange={(e) => setStateColor(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
        >
          <option value="">Seleccionar</option>
          <option value="info">Azul</option>
          <option value="primary">Azul oscuro</option>
          <option value="secondary">Gris / Morado</option>
          <option value="warning">Amarillo</option>
          <option value="success">Verde</option>
          <option value="danger">Rojo</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          % Avance
        </label>
        <input
          value={numPercPro ?? ""}
          autoFocus={autofocus}
          onChange={(e) => setNumPercPro(Number(e.target.value) || undefined)}
          placeholder="0"
          type="number"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Orden
        </label>
        <input
          value={numOrder ?? ""}
          autoFocus={autofocus}
          onChange={(e) => setNumOrder(Number(e.target.value) || undefined)}
          placeholder="1"
          type="number"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
        />
      </div>
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <Save className="size-4" /> Guardar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
