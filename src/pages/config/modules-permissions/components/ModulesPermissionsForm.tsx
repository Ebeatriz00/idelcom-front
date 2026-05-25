import type { ModulesPermissionsUpsertDto, OptionItem } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { useModulesOptions } from "@/sharedKernel/hooks/modules/useModules";
import { usePermissionsOptions } from "@/sharedKernel/hooks/permissions/usePermissions";
import { useEffect, useState } from "react";

export function ModulesPermissionsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  lockModule = false,
  moduleLabel,
  permissionLabel,
}: {
  defaultValues?: ModulesPermissionsUpsertDto;
  onSubmit: (dto: ModulesPermissionsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  lockModule?: boolean;
  moduleLabel?: string;
  permissionLabel?: string;
}) {
  const [modulesPermissionsId, setModulesPermissionsId] = useState<
    number | undefined
  >(defaultValues?.modulesPermissionsId);

  const [modulesId, setModulesId] = useState<number | undefined>(
    defaultValues?.modulesId
  );
  const [permissionsId, setPermissionsId] = useState<number | undefined>(
    defaultValues?.permissionsId
  );

  const [moduleOpt, setModuleOpt] = useState<OptionItem | null>(null);
  const [permissionOpt, setPermissionOpt] = useState<OptionItem | null>(null);

  useEffect(() => {
    setModulesPermissionsId(defaultValues?.modulesPermissionsId);
    setModulesId(defaultValues?.modulesId);
    setPermissionsId(defaultValues?.permissionsId);

    if (defaultValues?.modulesId != null) {
      setModuleOpt(
        (prev) =>
          prev ?? {
            value: Number(defaultValues.modulesId),
            label: moduleLabel ?? `ID ${defaultValues.modulesId}`,
          }
      );
    }
    if (defaultValues?.permissionsId != null) {
      setPermissionOpt(
        (prev) =>
          prev ?? {
            value: Number(defaultValues.permissionsId),
            label: permissionLabel ?? `ID ${defaultValues.permissionsId}`,
          }
      );
    }
  }, [defaultValues, moduleLabel, permissionLabel]);

  const valid = modulesId != null && permissionsId != null;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            modulesPermissionsId,
            modulesId: modulesId!,
            permissionsId: permissionsId!,
          });
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <label className="block text-sm font-medium">Módulo</label>
        <SearchSelect
          useOptions={useModulesOptions}
          value={moduleOpt}
          onChange={(opt) => {
            setModuleOpt(opt);
            setModulesId(opt ? Number(opt.value) : undefined);
          }}
          placeholder="Buscar módulo..."
          pageSize={10}
          minSearchChars={0}
          className="w-full"
          disabled={lockModule}
        />
        {!modulesId && (
          <p className="text-xs text-amber-600">Selecciona un módulo.</p>
        )}
        {lockModule && (
          <p className="text-xs text-gray-500">
            El módulo está bloqueado para esta edición.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Permiso</label>
        <SearchSelect
          useOptions={usePermissionsOptions}
          value={permissionOpt}
          onChange={(opt) => {
            setPermissionOpt(opt);
            setPermissionsId(opt ? Number(opt.value) : undefined);
          }}
          placeholder="Buscar permiso..."
          pageSize={10}
          minSearchChars={0}
          className="w-full"
        />
        {!permissionsId && (
          <p className="text-xs text-amber-600">Selecciona un permiso.</p>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
