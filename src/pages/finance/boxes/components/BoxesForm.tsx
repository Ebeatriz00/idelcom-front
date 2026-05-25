import type { BoxesUpsertDto, OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import { useCurrencyOptions } from "@/sharedKernel"; 
import { useEffect, useState } from "react";

export function BoxesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  currencyLabel,
}: {
  defaultValues?: Partial<BoxesUpsertDto>;
  onSubmit: (dto: BoxesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  currencyLabel?: string;
}) {
  const [boxesId, setBoxesId] = useState<number | undefined>(
    defaultValues?.boxesId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [currencyId, setCurrencyId] = useState<number | undefined>(
    defaultValues?.currencyId
  );

  const [currencyOpt, setCurrencyOpt] = useState<OptionItem | null>(null);

  const { data: currencyResp } = useCurrencyOptions(); 
  const currencyOptions: OptionItem[] = currencyResp?.items ?? [];

  useEffect(() => {
    setBoxesId(defaultValues?.boxesId);
    setDescription(defaultValues?.description ?? "");
    setCurrencyId(defaultValues?.currencyId);
  }, [defaultValues?.boxesId]);

  useEffect(() => {
    if (currencyId == null) return;
    if (currencyOpt?.value === currencyId) return;

    const found = currencyOptions.find(
      (o: OptionItem) => Number(o.value) === Number(currencyId)
    );

    if (found) {
      setCurrencyOpt(found);
      return;
    }
    if (currencyLabel) {
      setCurrencyOpt({
        value: Number(currencyId),
        label: currencyLabel,
      });
    }
  }, [currencyId, currencyLabel, currencyOptions]);

  const valid = !!description && !!currencyId;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            boxesId: boxesId,
            description,
            currencyId,
          });
        }
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-full">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <UpperInput
            mode="upper"
            value={description}
            autoFocus={autofocus}
            onValueChange={setDescription}
            placeholder="EJ: CAJA PRINCIPAL SOLES"
            maxLength={50} 
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>

        <div className="col-span-full min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Moneda
          </label>
          <SearchSelect
            useOptions={useCurrencyOptions} 
            value={currencyOpt}
            onChange={(opt) => {
              setCurrencyOpt(opt);
              setCurrencyId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar moneda..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!currencyId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona una moneda.
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}