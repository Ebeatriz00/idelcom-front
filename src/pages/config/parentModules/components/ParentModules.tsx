import type { ParentModulesUpsertDto } from "@/application";
import { NumericField, UpperInput } from "@/layouts";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

function toBool(x: unknown): boolean {
  if (typeof x === "boolean") return x;
  if (typeof x === "number") return x === 1;
  if (typeof x === "string") {
    const s = x.trim().toLowerCase();
    return s === "1" || s === "true" || s === "ABAJO" || s === "true";
  }
  return false;
}

export function ParentModulesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues: ParentModulesUpsertDto;
  onSubmit: (dto: ParentModulesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [parentModulesId, setParentModulesId] = useState<number | undefined>(
    defaultValues?.parentModulesId
  );
  const [code, setCode] = useState(defaultValues?.code ?? "");
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [stickyBottom, setStickyBottom] = useState<boolean>(
    toBool(defaultValues?.stickyBottom) // normaliza correctamente
  );
  const [orderNo, setOrderNo] = useState<number>(defaultValues?.orderNo);

  useEffect(() => {
    setParentModulesId(defaultValues?.parentModulesId);
    setCode(defaultValues?.code ?? "");
    setTitle(defaultValues?.title ?? "");
    setStickyBottom(toBool(defaultValues?.stickyBottom));
    setOrderNo(defaultValues?.orderNo);
  }, [defaultValues]);

  const handleSectionChange: React.Dispatch<React.SetStateAction<string>> = (
    next
  ) => {
    const val = typeof next === "function" ? next(title) : next;
    setTitle(val);
    const codeVal = val.trim().replace(/\s+/g, "_");
    setCode(codeVal);
  };

  const valid = title.trim().length >= 3;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            parentModulesId: parentModulesId,
            code: code.trim(),
            title: title,
            stickyBottom: stickyBottom,
            orderNo: orderNo,
          });
        }
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Código
          </label>
          <UpperInput
            mode="section"
            value={code}
            disabled
            onValueChange={setCode}
            placeholder="Código del módulo padre"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Sección
          </label>
          <UpperInput
            mode="section"
            value={title}
            onValueChange={handleSectionChange}
            placeholder="Nombre de la sección"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoFocus={autofocus}
          />
          <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Posición
          </label>
          <select
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={stickyBottom ? "true" : "false"}
            onChange={(e) => setStickyBottom(e.target.value === "true")}
          >
            <option value="false">Arriba</option>
            <option value="true">Abajo</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Orden
          </label>
          <NumericField
            value={orderNo}
            onChange={(v) => setOrderNo(v === "" ? 0 : v)}
            min={0}
            step={1}
            helperText="Solo números, sin ceros a la izquierda"
          />
        </div>
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
