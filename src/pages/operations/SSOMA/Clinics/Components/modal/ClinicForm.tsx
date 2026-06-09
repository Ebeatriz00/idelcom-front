import { UpperInput } from "@/layouts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { clinicSchema, type ClinicFormValues } from "../../utils/clinic.schema";

interface Props {
  defaultValues: Partial<ClinicFormValues>;
  onSubmit: (val: ClinicFormValues) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
}

export function ClinicForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: defaultValues ?? {
      clinicName: "",
      documentNumber: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as ClinicFormValues);
    }
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nombre de Clínica <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="clinicName"
            control={control}
            render={({ field }) => (
              <UpperInput
                value={field.value ?? ""}
                onValueChange={field.onChange}
                placeholder="Ingrese el nombre"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.clinicName
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              />
            )}
          />
          {errors.clinicName && (
            <p className="mt-1 text-xs text-rose-600">{errors.clinicName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nro. Documento
          </label>
          <Controller
            name="documentNumber"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Ingrese documento"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.documentNumber
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              />
            )}
          />
          {errors.documentNumber && (
            <p className="mt-1 text-xs text-rose-600">{errors.documentNumber.message}</p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex justify-end gap-2 pt-4">
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
                <Save className="size-4" /> Guardar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
