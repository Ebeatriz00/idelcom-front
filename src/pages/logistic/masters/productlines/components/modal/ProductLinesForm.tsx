import { UpperInput } from "@/layouts/presentation/inputs/input";
import { RHFSearchSelect } from "@/pages/crm/opportunity/components/detail/modal/form/RHFSearchSelect";
import { useCategoriesOptions } from "@/sharedKernel/hooks/logistic/masters/useCategories";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ProductLineFormValues } from "../../utils/productLines.schema";
import type { PropsForm } from "../../utils/productLines.type";

export function ProductLinesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  categoriesLabel,
}: PropsForm) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductLineFormValues>({
    mode: "onChange",
    defaultValues: {
      productLinesId: defaultValues?.productLinesId ?? undefined,
      description: defaultValues?.description ?? "",
      categoriesId: defaultValues?.categoriesId ?? undefined,
    },
  });

  useEffect(() => {
    reset({
      productLinesId: defaultValues?.productLinesId ?? undefined,
      description: defaultValues?.description ?? "",
      categoriesId: defaultValues?.categoriesId ?? undefined,
    });
  }, [defaultValues, reset]);

  const categoriesQuery = useCategoriesOptions();
  const categoriesOptions = useSelectOptions(categoriesQuery);
  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          productLinesId: values.productLinesId ?? undefined,
          categoriesId: Number(values.categoriesId),
          description: values.description.trim(),
        });
      })}
      className="space-y-4"
    >
      <div>
        <RHFSearchSelect<ProductLineFormValues>
          name={"categoriesId"}
          label={
            <span>
              Categoría <small className="text-xs text-rose-600">*</small>
            </span>
          }
          options={categoriesOptions}
          control={control}
          fallbackLabel={categoriesLabel}
          placeholder="Seleccione categoría…"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Descripción (Línea)
        </label>

        <Controller
          name="description"
          control={control}
          rules={{
            required: "La descripción es obligatoria",
            minLength: {
              value: 10,
              message: "Mínimo 10 caracteres",
            },
          }}
          render={({ field }) => (
            <UpperInput
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Ej: LÍNEA DE PRUEBA"
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
