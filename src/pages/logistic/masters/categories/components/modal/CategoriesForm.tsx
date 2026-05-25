import { UpperInput } from "@/layouts/presentation/inputs/input";

import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { CategoriesFormValues } from "../../utils/categories.schema";
import type { PropsForm } from "../../utils/categories.type";

export function CategoriesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: PropsForm) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CategoriesFormValues>({
    mode: "onChange",
    defaultValues: {
      categoriesId: defaultValues?.categoriesId ?? undefined,
      description: defaultValues?.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      categoriesId: defaultValues?.categoriesId ?? undefined,
      description: defaultValues?.description ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          categoriesId: values.categoriesId ?? undefined,
          description: values.description.trim(),
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>
        <Controller
          name="description"
          control={control}
          rules={{
            required: "La categoría es obligatoria",
            minLength: {
              value: 10,
              message: "Mínimo 10 caracteres",
            },
          }}
          render={({ field }) => (
            <UpperInput
              value={field.value}
              onValueChange={field.onChange}
              autoFocus={autofocus}
              placeholder="Ingrese la  categoría"
              maxLength={60}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            />
          )}
        />
        {errors.description ? (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Mínimo 10 caracteres</p>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!isValid || saving}
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
