import type { JobTitleUpsertDto, OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import { useAreaOption } from "@/sharedKernel";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function JobTitleForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  areaLabel,
}: {
  defaultValues?: Partial<JobTitleUpsertDto>;
  onSubmit: (dto: JobTitleUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  areaLabel?: string;
}) {
  const [jobTitleId, setJobTitleId] = useState<number | undefined>(
    defaultValues?.jobTitleId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [areaId, setAreaId] = useState<number | undefined>(
    defaultValues?.areaId
  );
  const [areaOpt, setAreaOpt] = useState<OptionItem | null>(
    null
  )

  const { data: areaResp } = useAreaOption(1,"",10);
  const areaOptions: OptionItem[] = areaResp?.items ?? []

  useEffect(() => {
    setJobTitleId(defaultValues?.jobTitleId);
    setDescription(defaultValues?.description ?? "");
    setAreaId(defaultValues?.areaId);
  }, [defaultValues, areaId]);

  const valid = areaId != null && areaId > 0 && description.trim().length >= 3;

  useEffect(() => {
    if (areaId == null) return;
    if (areaOpt?.value === areaId) return;

    const found = areaOptions.find(
      (o: OptionItem) => Number(o.value) === Number(areaId)
    );

    if (found) {
      setAreaOpt(found);
      return;
    }
    if (areaLabel) {
      setAreaOpt({
        value: Number(areaId),
        label: areaLabel,
      });
    }
  }, [areaId, areaLabel, areaOptions]);

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            jobTitleId,
            areaId,
            description: description.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Área
          </label>
          <SearchSelect
            useOptions={useAreaOption}
            value={areaOpt}
            onChange={(option) => {
              setAreaOpt(option);
              setAreaId(option ? Number(option.value) : undefined);
            }}
            placeholder="Seleccione un área"
            pageSize={10}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción del Cargo
          </label>
          <UpperInput
            value={description}
            onValueChange={setDescription}
            placeholder="Ej: GERENTE DE VENTAS"
            maxLength={100}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
          <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
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
