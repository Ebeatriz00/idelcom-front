import type { AreaUpsertDto } from "@/application";
import { UpperInput } from "@/layouts";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function AreaForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  onCancel,
}: {
  defaultValues?: AreaUpsertDto;
  onSubmit: (dto: AreaUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  onCancel?: () => void;
}) {
  const [areaId, setAreaId] = useState<number | undefined>(
    defaultValues?.areaId
  );
  const [businessId, setBusinessId] = useState<number | undefined>(
    defaultValues?.businessId
  );
  const [areadesc, setAreadesc] = useState(defaultValues?.description ?? "");

  useEffect(() => {
    setAreaId(defaultValues?.areaId);
    setBusinessId(defaultValues?.businessId);
    setAreadesc(defaultValues?.description ?? "");
  }, [defaultValues]);

  const valid = areadesc.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            areaId,
            businessId,
            description: areadesc.trim(),
            usersBy: defaultValues?.usersBy,
          });
        }
      }}
      className="space-y-3"
    >
      <div>
        <label
          htmlFor="area-desc"
          className="mb-1 block text-xs font-medium text-gray-600"
        >
          Descripción del Área
        </label>
        <UpperInput
          id="description"
          value={areadesc}
          onValueChange={setAreadesc}
          placeholder="Ejemplo: Recursos Humanos, Contabilidad..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel ?? (() => history.back())}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black disabled:opacity-60"
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
