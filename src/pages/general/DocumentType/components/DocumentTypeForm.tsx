import type { DocumentTypeUpsertDto } from "@/application";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { UpperInput } from "@/layouts/presentation/inputs/input";

export function DocumentTypeForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  // El tipo de los datos se define aquí directamente
  defaultValues?: DocumentTypeUpsertDto;
  onSubmit: (dto: DocumentTypeUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [documentTypeId, setDocumentTypeId] = useState<number | undefined>(
    defaultValues?.documentTypeId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [codeSunat, setcodeSunat] = useState(defaultValues?.codeSunat ?? "");

  useEffect(() => {
    setDocumentTypeId(defaultValues?.documentTypeId);
    setDescription(defaultValues?.description ?? "");
    setcodeSunat(defaultValues?.codeSunat ?? "");
  }, [defaultValues]);

  const valid =
    description.trim().length >= 3 && codeSunat.trim().length > 0;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            documentTypeId: documentTypeId,
            description: description.trim(),
            codeSunat: codeSunat.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <UpperInput
          value={description}
          onValueChange={setDescription}
          placeholder="Ej: FACTURA ELECTRÓNICA"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Código SUNAT
        </label>
        <UpperInput
          value={codeSunat}
          onValueChange={setcodeSunat}
          placeholder="Ej: 01"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Campo requerido</p>
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
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black disabled:opacity-60"
          >
            {saving ? "Guardando…" : <><Save className="size-4" /> Guardar</>}
          </button>
        </div>
      )}
    </form>
  );
}