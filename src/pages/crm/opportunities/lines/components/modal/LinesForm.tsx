import type { BusinessLineUpsertDto } from "@/application";
import { UpperInput } from "@/layouts";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function LinesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: BusinessLineUpsertDto;
  onSubmit: (dto: BusinessLineUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [businessLineId, setBusinessLineId] = useState<number | undefined>(
    defaultValues?.businessLineId
  );
  const [descLine, setdescLine] = useState(defaultValues?.descLine ?? "");

  useEffect(() => {
    setBusinessLineId(defaultValues?.businessLineId);
    setdescLine(defaultValues?.descLine ?? "");
  }, [defaultValues]);

  const valid = descLine.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            businessLineId: businessLineId,
            descLine: descLine.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Fuente
        </label>
        <UpperInput
          value={descLine}
          onValueChange={setdescLine}
          placeholder="Ej: CENTRO DE DATOS"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
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
