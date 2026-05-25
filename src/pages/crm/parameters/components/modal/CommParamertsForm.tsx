import type { CommercialParametersUpsertDto } from "@/application";
import { UpperInput } from "@/layouts";
import { NumberInput } from "@/layouts/presentation/inputs/NumberInput";
import { useEffect, useState } from "react";

export function CommercialParametersForm({
  defaultValues,
  onSubmit,
  formId,
  autofocus = true,
}: {
  defaultValues?: CommercialParametersUpsertDto;
  onSubmit: (dto: CommercialParametersUpsertDto) => void;
  formId?: string;
  autofocus?: boolean;
}) {
  const [commercialParametersId, setCommercialParametersId] = useState<number | undefined>(defaultValues?.commercialParametersId);

  const [parametersName, setParametersName] = useState(
    defaultValues?.parametersName ?? ""
  );

  const [parametersValue, setParametersValue] = useState(
    defaultValues?.parametersValue ?? 0
  );

  // Inicializa según si viene valor mínimo desde backend
  const hasMinValue =
    defaultValues?.minValue !== null && defaultValues?.minValue !== undefined;

  const [enableMinValue, setEnableMinValue] = useState(hasMinValue);

  const [minValue, setMinValue] = useState<number>(
    hasMinValue ? defaultValues!.minValue! : 0
  );

  useEffect(() => {
    setCommercialParametersId(defaultValues?.commercialParametersId);
    setParametersName(defaultValues?.parametersName ?? "");
  }, [defaultValues]);

  const valid = parametersName.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            commercialParametersId,
            parametersName: parametersName.trim(),
            parametersValue,
            minValue: enableMinValue ? minValue : undefined,
          });
        }
      }}
      className="space-y-4"
    >
      {/* Nombre */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Parámetro
        </label>
        <UpperInput
          value={parametersName}
          onValueChange={setParametersName}
          placeholder="Ej: Notificaciones"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      {/* Valor */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Valor
        </label>
        <NumberInput
          value={parametersValue}
          onValueChange={setParametersValue}
          placeholder="Ej: 15"
          step="0"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        />
      </div>

      {/* Checkbox → activar valor mínimo */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enableMinValue}
          onChange={(e) => {
            const checked = e.target.checked;
            setEnableMinValue(checked);

            if (checked && !hasMinValue) setMinValue(0);
          }}
        />
        <label className="text-xs font-medium text-gray-600">
          ¿Usar valor mínimo?
        </label>
      </div>

      {/* Solo se muestra si el checkbox está activado */}
      {enableMinValue && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Valor mínimo
          </label>
          <NumberInput
            value={minValue}
            onValueChange={setMinValue}
            placeholder="Ej: 5"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
      )}
    </form>
  );
}
