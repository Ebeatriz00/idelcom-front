import type { RequirementUpsertDto } from "@/application/dtos/operations/requirement/requeriment.dto";
import { NumericField, UpperInput, UpperTextarea } from "@/layouts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  requirementSchema,
  type RequirementFormValues,
} from "../../utils/requirement.schema";
import type { PropsForm } from "../../utils/types";

export function RequirementForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
}: PropsForm) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      duration: 0,
      scopeId: 0,
      hasExpiration: false,
      requiresFile: false,
      requiresExpiration: false,
      maxFileSize: 0,
      allowedExtensions: "",
      allowInternalReuse: false,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as RequirementFormValues);
    }
  }, [defaultValues, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((data) => onSubmit(data as RequirementUpsertDto))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nombre del Requerimiento <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <UpperInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Ej: EXAMEN MÉDICO"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <UpperTextarea
                value={field.value ?? ""}
                onValueChange={field.onChange}
                mode="none"
                placeholder="Descripción detallada..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            )}
          />
        </div>

        {/* Alcance (Select) */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Alcance <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="scopeId"
            control={control}
            render={({ field }) => (
              <select
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.scopeId
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              >
                <option value={0} disabled>Seleccione un alcance</option>
                <option value={1}>INTERNO</option>
                <option value={2}>PROYECTO</option>
              </select>
            )}
          />
          {errors.scopeId && (
            <p className="mt-1 text-xs text-rose-600">{errors.scopeId.message}</p>
          )}
        </div>

        {/* Duración */}
        <div>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <NumericField
                label="Duración (días)"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.duration?.message}
              />
            )}
          />
        </div>

        {/* Tamaño Máximo Archivo */}
        <div>
          <Controller
            name="maxFileSize"
            control={control}
            render={({ field }) => (
              <NumericField
                label="Tamaño Máximo (MB)"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.maxFileSize?.message}
              />
            )}
          />
        </div>

        {/* Extensiones Permitidas */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Extensiones (ej: .pdf,.jpg)
          </label>
          <Controller
            name="allowedExtensions"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder=".pdf, .png"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Controller
              name="hasExpiration"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
              Tiene Vencimiento
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Controller
              name="requiresExpiration"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
              Requiere Fecha
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Controller
              name="requiresFile"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
              Requiere Archivo
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Controller
              name="allowInternalReuse"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
              Reutilizable
            </span>
          </label>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 transition-colors"
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <Save className="size-4" /> Guardar Requerimiento
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
