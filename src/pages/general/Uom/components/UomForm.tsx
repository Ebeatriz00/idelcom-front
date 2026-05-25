import type { UomUpsertDto } from "@/application";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { UpperInput } from "@/layouts/presentation/inputs/input";

export function UomForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: UomUpsertDto;
  onSubmit: (dto: UomUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [uomId, setUomId] = useState<number | undefined>(defaultValues?.uomId);
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [codeSunat, setCodeSunat] = useState(defaultValues?.codeSunat ?? "");
  const [symbol, setSymbol] = useState(defaultValues?.symbol ?? "");
  const [codeSunatError, setCodeSunatError] = useState<string | null>(null);

  // Efecto para cargar los datos iniciales cuando el formulario abre o cambia el `defaultValues`
  useEffect(() => {
    setUomId(defaultValues?.uomId);
    setDescription(defaultValues?.description ?? "");
    setCodeSunat(defaultValues?.codeSunat ?? "");
    setSymbol(defaultValues?.symbol ?? "");
  }, [defaultValues]);

  // Efecto para validar el campo `codeSunat` cada vez que su valor cambia
  useEffect(() => {
    if (codeSunat.length > 3) {
      setCodeSunatError("El código no puede tener más de 3 caracteres.");
    } else {
      setCodeSunatError(null); // Limpia el error si la longitud es correcta
    }
  }, [codeSunat]);

  // Constante que determina si el formulario es válido para ser enviado
  const valid =
    description.trim().length >= 3 &&
    codeSunat.trim().length > 0 &&
    symbol.trim().length > 0 &&
    codeSunatError === null;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            uomId: uomId,
            description: description.trim(),
            codeSunat: codeSunat.trim(),
            symbol: symbol.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      {/* Campo: Nombre de la Unidad de Medida */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nombre de la Unidad de Medida
        </label>
        <UpperInput
          value={description}
          onValueChange={setDescription}
          placeholder="Ej: KILOGRAMO"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      {/* Fila para Código SUNAT y Símbolo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Campo: Código SUNAT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Código SUNAT
          </label>
          <UpperInput
            value={codeSunat}
            onValueChange={setCodeSunat}
            placeholder="Ej: NIU"
            maxLength={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
          {codeSunatError && (
            <p className="mt-1 text-xs text-red-600">{codeSunatError}</p>
          )}
        </div>

        {/* Campo: Símbolo */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Símbolo
          </label>
          <UpperInput
            value={symbol}
            onValueChange={setSymbol}
            placeholder="Ej: KG"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Acciones del formulario */}
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