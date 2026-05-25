import type { OptionItem, SeriesUpsertDto } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { NumberInput } from "@/layouts/presentation/inputs/NumberInput";
import { usePaymentTypeOptions } from "@/sharedKernel/hooks/accounting/usePaymentType";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function SeriesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  paymentTypeLabel,
}: {
  defaultValues?: Partial<SeriesUpsertDto>;
  onSubmit: (dto: SeriesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  paymentTypeLabel?: string;
}) {
  const [seriesId, setSeriesId] = useState<number | undefined>(
    defaultValues?.seriesId
  );
  const [seriesName, setSeriesName] = useState(defaultValues?.seriesName ?? "");
  const [correlative, setCorrelative] = useState<number | undefined>(
    defaultValues?.correlative
  );
  const [used, setUsed] = useState(defaultValues?.used ?? '');
  const [paymentTypeId, setPaymentTypeId] = useState<number | undefined>(
    defaultValues?.paymentTypeId
  );
  const [paymentTypeOption, setPaymentTypeOption] = useState<OptionItem | null>(
    defaultValues?.paymentTypeId && paymentTypeLabel
      ? { value: defaultValues.paymentTypeId, label: paymentTypeLabel }
      : null
  );

  useEffect(() => {
    setSeriesId(defaultValues?.seriesId);
    setSeriesName(defaultValues?.seriesName ?? "");
    setCorrelative(defaultValues?.correlative);
    setUsed(defaultValues?.used ?? '');
    setPaymentTypeId(defaultValues?.paymentTypeId);

    if (defaultValues?.paymentTypeId && paymentTypeLabel) {
      setPaymentTypeOption({
        value: defaultValues.paymentTypeId,
        label: paymentTypeLabel,
      });
    } else {
      setPaymentTypeOption(null);
    }
  }, [defaultValues, paymentTypeLabel]);

  const valid =
    paymentTypeId != null &&
    paymentTypeId > 0 &&
    seriesName.trim().length >= 4 &&
    correlative != null &&
    correlative >= 0 &&
    used.trim().length > 0;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            seriesId,
            paymentTypeId,
            seriesName: seriesName.trim(),
            correlative,
            used: used.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Comprobante
          </label>
          <SearchSelect
            useOptions={usePaymentTypeOptions}
            value={paymentTypeOption}
            onChange={(option) => {
              setPaymentTypeOption(option);
              setPaymentTypeId(option ? Number(option.value) : undefined);
            }}
            placeholder="Seleccione un tipo"
            pageSize={10}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nombre de la Serie
          </label>
          <UpperInput
            value={seriesName}
            onValueChange={setSeriesName}
            placeholder="Ej: F001"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
          <p className="mt-1 text-xs text-gray-500">Mínimo 4 caracteres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Correlativo Inicial
          </label>
          <NumberInput
            value={correlative ?? 0}
            onValueChange={setCorrelative}
            placeholder="Ej: 1"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Número con el que iniciará la serie.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Indicador de Uso
          </label>
          <UpperInput
            value={used}
            onValueChange={setUsed}
            placeholder="Ej: S"
            maxLength={1}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Un solo carácter (letra o número).
          </p>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? "Guardando…" : (
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