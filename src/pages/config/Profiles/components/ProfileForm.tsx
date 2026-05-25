import type { ProfileUpsertDto } from "@/application";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { UpperTextarea } from "@/layouts/presentation/texTarea";

export function ProfileForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: ProfileUpsertDto;
  onSubmit: (dto: ProfileUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [profilesId, setProfilesId] = useState<number | undefined>(
    defaultValues?.profilesId
  );
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );

  useEffect(() => {
    setProfilesId(defaultValues?.profilesId);
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
  }, [defaultValues]);

  const valid = name.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            profilesId: profilesId,
            name: name.trim(),
            description: description.trim(),
          });
        }
      }}
      className="space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nombre
        </label>
        <UpperInput
          value={name}
          onValueChange={setName}
          placeholder="Nombre del perfil"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <UpperTextarea
          value={description}
          onValueChange={setDescription}
          placeholder="Descripción del perfil"
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
        />
      </div>
      {showActions && (
        <div className="flex items-center justify-end gap-2">
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
