import type { PermissionsUpsertDto } from "@/application/dtos/configurations/Permissions/Permissions.dto";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { UpperTextarea } from "@/layouts/presentation/texTarea";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function PermissionsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: PermissionsUpsertDto;
  onSubmit: (dto: PermissionsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [permissionsId, setPermissionsId] = useState<number | undefined>(
    defaultValues?.permissionsId
  );
  const [permissionsCode, setPermissionsCode] = useState(
    defaultValues?.permissionsCode ?? ""
  );
  const [permissionsName, setPermissionsName] = useState(
    defaultValues?.permissionsName ?? ""
  );
  const [permissionsDescription, setPermissionsDescription] = useState(
    defaultValues?.permissionsDescription ?? ""
  );

  useEffect(() => {
    setPermissionsId(defaultValues?.permissionsId);
    setPermissionsCode(defaultValues?.permissionsCode ?? "");
    setPermissionsName(defaultValues?.permissionsName ?? "");
    setPermissionsDescription(defaultValues?.permissionsDescription ?? "");
  }, [defaultValues]);

  const valid = permissionsName.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            permissionsId: permissionsId,
            permissionsCode: permissionsCode.trim(),
            permissionsName: permissionsName.trim(),
            permissionsDescription: permissionsDescription.trim(),
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
          value={permissionsName}
          onValueChange={setPermissionsName}
          placeholder="Nombre del permiso"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Código
        </label>
        <UpperInput
          value={permissionsCode}
          onValueChange={setPermissionsCode}
          placeholder="codigo del permiso"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <UpperTextarea
          value={permissionsDescription}
          onValueChange={setPermissionsDescription}
          placeholder="Descripción del permiso"
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
