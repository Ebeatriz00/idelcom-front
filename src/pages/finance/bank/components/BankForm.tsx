import type { BankUpsertDto } from "@/application";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";


export function BankForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: Partial<BankUpsertDto>;
  onSubmit: (dto: BankUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [bankId, setBankId] = useState<number | undefined>(
    defaultValues?.bankId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [abrv, setAbrv] = useState(defaultValues?.abrv ?? "");

  useEffect(() => {
    setBankId(defaultValues?.bankId);
    setDescription(defaultValues?.description ?? "");
    setAbrv(defaultValues?.abrv ?? "");
  }, [defaultValues]);

  const valid =
    abrv.trim().length > 0 &&
    description.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            bankId,
            abrv: abrv.trim(),
            description: description.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      {}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <UpperInput
            value={description}
            onValueChange={setDescription}
            placeholder="Ej: BANCO DE CREDITO"
            maxLength={60}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus} 
          />
          <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Abreviatura
          </label>
          <UpperInput
            value={abrv}
            onValueChange={setAbrv}
            placeholder="Ej: BCP"
            maxLength={5}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Máximo 5 caracteres</p>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
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