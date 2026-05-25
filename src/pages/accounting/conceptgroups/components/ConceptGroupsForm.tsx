import type { OptionItem, ConceptGroupsUpsertDto } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { UpperInput } from "@/layouts/presentation/inputs/input";

import { useConceptType } from "@/sharedKernel/hooks/conceptType/useConceptType"; 
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function ConceptGroupsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  conceptTypeLabel,
}: {
  defaultValues?: Partial<ConceptGroupsUpsertDto>;
  onSubmit: (dto: ConceptGroupsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  conceptTypeLabel?: string;
}) {

  const [conceptGroupsId, setConceptGroupsId] = useState<number | undefined>(
    defaultValues?.conceptGroupsId
  );
  const [code, setCode] = useState(defaultValues?.code ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [conceptTypeId, setConceptTypeId] = useState<number | undefined>(
    defaultValues?.conceptTypeId
  );
  const [conceptTypeOption, setConceptTypeOption] = useState<OptionItem | null>(
    defaultValues?.conceptTypeId && conceptTypeLabel
      ? { value: defaultValues.conceptTypeId, label: conceptTypeLabel }
      : null
  );

  useEffect(() => {
    setConceptGroupsId(defaultValues?.conceptGroupsId);
    setCode(defaultValues?.code ?? "");
    setDescription(defaultValues?.description ?? "");
    setConceptTypeId(defaultValues?.conceptTypeId);

    if (defaultValues?.conceptTypeId && conceptTypeLabel) {
      setConceptTypeOption({
        value: defaultValues.conceptTypeId,
        label: conceptTypeLabel,
      });
    } else {
      setConceptTypeOption(null);
    }
  }, [defaultValues, conceptTypeLabel]);

  const valid =
    conceptTypeId != null &&
    conceptTypeId > 0 &&
    code.trim().length > 0 &&
    description.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            conceptGroupsId,
            conceptTypeId,
            code: code.trim(),
            description: description.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Concepto
          </label>
          <SearchSelect
            useOptions={useConceptType}
            value={conceptTypeOption}
            onChange={(option) => {
              setConceptTypeOption(option);
              setConceptTypeId(option ? Number(option.value) : undefined);
            }}
            placeholder="Seleccione un tipo"
            pageSize={10}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Código
          </label>
          <UpperInput
            value={code}
            onValueChange={setCode}
            placeholder="Ej: C01"
            maxLength={10}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
          <p className="mt-1 text-xs text-gray-500">Máximo 10 caracteres</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <UpperInput
          value={description}
          onValueChange={setDescription}
          placeholder="Ej: GRUPO DE PRUEBA"
          maxLength={60}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
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