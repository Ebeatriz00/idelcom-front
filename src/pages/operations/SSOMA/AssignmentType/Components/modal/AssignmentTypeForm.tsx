import { UpperInput } from "@/layouts";
import { useEffect, useState } from "react";
import type { PropsForm } from "../../utils/types";

export function AssignmentTypeForm({
  defaultValues,
  onSubmit,
  formId,
  autofocus = true,
}: PropsForm) {
  const [ssomaAssignamentTypeId, setSsomaAssignmentTypeId] = useState<
    number | undefined
  >(defaultValues?.ssomaAssignamentTypeId);
  const [description, setDescription] = useState(
    defaultValues?.ssomaAssignamentName ?? "",
  );

  useEffect(() => {
    setSsomaAssignmentTypeId(defaultValues?.ssomaAssignamentTypeId);
    setDescription(defaultValues?.ssomaAssignamentName ?? "");
  }, [defaultValues]);

  const valid = description.trim().length >= 3;
  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            ssomaAssignamentTypeId: ssomaAssignamentTypeId,
            ssomaAssignamentName: description.trim(),
          });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Tipo de Asignación
        </label>
        <UpperInput
          value={description}
          onValueChange={setDescription}
          placeholder="Ej: "
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          autoFocus={autofocus}
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres</p>
      </div>
    </form>
  );
}
