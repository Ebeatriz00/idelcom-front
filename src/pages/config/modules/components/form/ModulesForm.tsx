// modules/ModulesForm.tsx
import type { ModulesUpsertDto } from "@/application";
import { UpperInput } from "@/layouts";
import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Icon, IconPicker, type TreeNode } from "../aside/tree";
import { ParentSelector , type ParentRef} from "../aside/tree/parentSelector";

export function ModulesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  sectionTitle,
  tree,
  currentParent,
}: {
  defaultValues?: ModulesUpsertDto;
  onSubmit: (dto: ModulesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  sectionTitle?: string;
  tree?: TreeNode[];
  currentParent?: {
    id?: number | string | null;
    modulesId?: number | null;
  } | null;
}) {
  const [modulesId, setModulesId] = useState<number | undefined>(
    defaultValues?.modulesId
  );
  const [parentModulesId, setParentModulesId] = useState<number | undefined>(
    defaultValues?.parentModulesId ??
      (currentParent?.modulesId as number | undefined)
  );
  const [parentId, setParentId] = useState<number | undefined>(
    defaultValues?.parentId ??
      (typeof currentParent?.id === "number"
        ? (currentParent?.id as number)
        : undefined)
  );

  const [code, setCode] = useState(defaultValues?.code ?? "");
  const [label, setLabel] = useState(defaultValues?.label ?? "");
  const [modulesDescription, setModulesDescription] = useState(
    defaultValues?.modulesDescription ?? ""
  );
  const [icon, setIcon] = useState(defaultValues?.icon ?? "");
  const [path, setPath] = useState(defaultValues?.path ?? "");
  const [orderNo, setOrderNo] = useState<number | undefined>(
    defaultValues?.orderNo
  );

  useEffect(() => {
    setModulesId(defaultValues?.modulesId);
    setParentModulesId(
      defaultValues?.parentModulesId ??
        (currentParent?.modulesId as number | undefined)
    );
    setParentId(
      defaultValues?.parentId ??
        (typeof currentParent?.id === "number"
          ? (currentParent?.id as number)
          : undefined)
    );
    setCode(defaultValues?.code ?? "");
    setLabel(defaultValues?.label ?? "");
    setModulesDescription(defaultValues?.modulesDescription ?? "");
    setIcon(defaultValues?.icon ?? "");
    setPath(defaultValues?.path ?? "");
    setOrderNo(defaultValues?.orderNo);
  }, [defaultValues, currentParent]);

  const isFolder = useMemo(() => !path || path.trim() === "", [path]);
  const valid = (label ?? "").trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          modulesId: modulesId,
          parentModulesId: parentModulesId ?? 0,
          parentId: parentId ?? 0,
          code: (code ?? "").trim().toUpperCase(),
          label: (label ?? "").trim(),
          modulesDescription: (modulesDescription ?? "").trim(),
          icon: (icon ?? "").trim(),
          path: (path ?? "").trim(),
          orderNo: orderNo ?? 0,
        });
      }}
      className="space-y-4"
    >
      {/* Sección + Carpeta padre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Sección
          </label>
          <input
            readOnly
            value={sectionTitle ?? ""}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Carpeta padre
          </label>
          <ParentSelector
            sectionTitle={sectionTitle ?? ""}
            tree={tree ?? []}
            currentParent={
              currentParent
                ? {
                    id: typeof currentParent.id === "number" ? currentParent.id : null,
                    label: String((currentParent as any).label ?? ""),
                  }
                : { id: null, label: null }
            }
            onPick={(p) => {
              // Si vino por CODE:
              if ("by" in (p as any) && (p as any).by === "code") {
                // guarda el code para enviarlo al backend si usas esa resolución
                // setParentCode((p as any).code);
                // setParentId(null);
                return;
              }
              // Si vino por selección en árbol/buscar:
              const parent = p as ParentRef;
              // setParentCode(undefined);
              setParentModulesId(parent?.id ?? 0);
              setParentId(parent?.id ?? 0);
            }}
          />
        </div>
      </div>

      {/* Etiqueta + CODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Etiqueta
          </label>
          <UpperInput
            value={label}
            onValueChange={setLabel}
            placeholder="Ej. Configuración General"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
          <p className="text-xs text-gray-500 mt-1">
            {isFolder ? "Carpeta (sin ruta)" : "Ítem con ruta"}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            CODE (slug estable, admin)
          </label>
          <UpperInput
            value={code}
            onValueChange={setCode}
            placeholder="SEG_CONF_MODULOS"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Ruta + Icono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Ruta (href)
          </label>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/Security/Configuration/Modules"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Icono (Lucide)
          </label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <textarea
          value={modulesDescription}
          onChange={(e) => setModulesDescription(e.target.value)}
          placeholder="Descripción del módulo"
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
        />
      </div>

      {/* Orden + hint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Orden
          </label>
          <input
            type="number"
            value={orderNo ?? 0}
            onChange={(e) => setOrderNo(Number(e.target.value || 0))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            inputMode="numeric"
          />
        </div>
        <div className="flex items-end justify-start md:justify-end">
          <span className="text-xs text-gray-500">
            {isFolder
              ? "Este módulo se guardará como carpeta."
              : "Este módulo tendrá navegación (ruta)."}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border p-3 text-sm bg-white">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="w-5 h-5" />
          <span className="font-medium">
            {label?.trim() || "(sin etiqueta)"}
          </span>
          {path ? (
            <code className="ml-auto px-2 py-0.5 bg-gray-50 rounded border">
              {path}
            </code>
          ) : (
            <span className="ml-auto text-gray-500">carpeta</span>
          )}
        </div>
      </div>

      {/* Acciones */}
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
