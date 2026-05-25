import type { CurrencyUpsertDto } from "@/application";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { generateNextCurrencyCode } from "@/sharedKernel/utils/generateCode";

export function CurrencyForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: CurrencyUpsertDto;
  onSubmit: (dto: CurrencyUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [currencyId, setCurrencyId] = useState<number | undefined>(
    defaultValues?.currencyId
  );
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [code, setCode] = useState(defaultValues?.code ?? "");
  const [codeSunat, setCodeSunat] = useState(defaultValues?.codeSunat ?? "");
  const [symbol, setSymbol] = useState(defaultValues?.symbol ?? "");

  useEffect(() => {
    setCurrencyId(defaultValues?.currencyId);
    setDescription(defaultValues?.description ?? "");
    setCode(defaultValues?.code ?? "");
    setCodeSunat(defaultValues?.codeSunat ?? "");
    setSymbol(defaultValues?.symbol ?? "");
  }, [defaultValues]);
  

  // 🔹 NUEVO useEffect: genera automáticamente el código cuando se escribe una moneda
  useEffect(() => {
    const generarCodigo = async () => {
      if (description.trim().length >= 3 && !defaultValues?.currencyId) {
        const nextCode = await generateNextCurrencyCode();
        setCode(nextCode);
      }
    };
    generarCodigo();
  }, [description, defaultValues?.currencyId]);

  const valid =
    description.trim().length >= 3 &&
    code.trim().length > 0 &&
    codeSunat.trim().length > 0 &&
    symbol.trim().length > 0;
console.log({ description, code, codeSunat, symbol, valid });
  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            currencyId: currencyId,
            description: description.trim(),
            code: code.trim(),
            codeSunat: codeSunat.trim(),
            symbol: symbol.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      {/* Campo: Nombre de la Moneda */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nombre de la Moneda
        </label>
        <UpperInput
          value={description}
          onValueChange={setDescription}
          placeholder="Ej: DÓLAR AMERICANO"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      {/* Fila para Códigos y Símbolo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Campo: Código ISO */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Código ISO
          </label>
          <UpperInput
            value={code}
            onValueChange={setCode}
            placeholder="Ej: 01"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            readOnly // 👈 evita que el usuario lo cambie manualmente
          />
        </div>

        {/* Campo: Código SUNAT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Código SUNAT
          </label>
          <UpperInput
            value={codeSunat}
            onValueChange={setCodeSunat}
            placeholder="Ej: PEN"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>

        {/* Campo: Símbolo */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Símbolo
          </label>
          <UpperInput
            value={symbol}
            onValueChange={setSymbol}
            placeholder="Ej: $"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Acciones */}
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
