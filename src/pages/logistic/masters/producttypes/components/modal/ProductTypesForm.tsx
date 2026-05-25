import type { ProductTypesUpsertDto } from "@/application/dtos/logistic/masters/producttypes/ProductTypes.dto";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ProductTypeFormValues } from "../../utils/productType.schema";
import type { PropsForm } from "../../utils/productType.type";

export function ProductTypesForm({
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
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProductTypeFormValues>({
    mode: "onChange",
    defaultValues: defaultValues ?? {
      description: "",
      isConsumable: false,
      isReturnable: false,
      requiresSerial: false,
    },
  });

  const isConsumable = watch("isConsumable");
  const requiresSerial = watch("requiresSerial");

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as ProductTypeFormValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isConsumable) {
      setValue("isReturnable", false);
      setValue("requiresSerial", false);
    }
  }, [isConsumable, setValue]);

  useEffect(() => {
    if (requiresSerial) {
      setValue("isConsumable", false);
      setValue("isReturnable", true);
    }
  }, [requiresSerial, setValue]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((data) => onSubmit(data as ProductTypesUpsertDto))}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción
        </label>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <UpperInput
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              autoFocus={autofocus}
              placeholder="Ej: HERRAMIENTA MANUAL"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          )}
        />

        {errors.description?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-3 text-sm">
        <Controller
          name="isConsumable"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              Consumible
            </label>
          )}
        />

        <Controller
          name="isReturnable"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value ?? false}
                disabled={isConsumable}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              Retornable
            </label>
          )}
        />

        <Controller
          name="requiresSerial"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value ?? false}
                disabled={isConsumable}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              Requiere serie
            </label>
          )}
        />
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
