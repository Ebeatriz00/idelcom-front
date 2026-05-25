import { SearchSelect, UpperInput, UpperTextarea } from "@/layouts";
import { useSupportStateOptions } from "@/sharedKernel";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  supportSchema,
  type SupportFormValues,
} from "../../utils/support.schema";
import type { PropsForm } from "../../utils/types";

export function SupportForm({
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
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: defaultValues ?? {
      provider: "",
      service: "",
      url: "",
      access: "",
      email: "",
      username: "",
      password: "",
      supportState: 1,
      startDate: "",
      expirationDate: "",
      comments: "",
      remarks: "",
    },
  });

  const { data: supportStateResp } = useSupportStateOptions(1, "", 50);
  const supportStateOptions = useMemo(
    () => supportStateResp?.items ?? [],
    [supportStateResp]
  );

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as SupportFormValues);
    }
  }, [defaultValues, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((data) => onSubmit(data as any))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proveedor */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Proveedor <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <UpperInput
                value={field.value ?? ""}
                onValueChange={field.onChange}
                placeholder="Ej: AWS"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.provider
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              />
            )}
          />
          {errors.provider && (
            <p className="mt-1 text-xs text-rose-600">{errors.provider.message}</p>
          )}
        </div>

        {/* Servicio */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Servicio <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <UpperInput
                value={field.value ?? ""}
                onValueChange={field.onChange}
                placeholder="Ej: EC2"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.service
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-gray-200 bg-gray-50 focus:ring-blue-500"
                }`}
              />
            )}
          />
          {errors.service && (
            <p className="mt-1 text-xs text-rose-600">{errors.service.message}</p>
          )}
        </div>

        {/* URL */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">URL / Link</label>
          <Controller
            name="url"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Accesos */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Nivel de Acceso</label>
          <Controller
            name="access"
            control={control}
            render={({ field }) => (
              <UpperInput
                value={field.value ?? ""}
                onValueChange={field.onChange}
                placeholder="Ej: Admin Console"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Usuario & Correo */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Usuario</label>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Usuario..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Correo</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                type="email"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Contraseña</label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="***"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Estado del servicio <span className="text-rose-500">*</span></label>
          <Controller
            name="supportState"
            control={control}
            render={({ field }) => {
              const currentVal =
                supportStateOptions.find((o) => Number(o.value) === field.value) ||
                (field.value
                  ? { value: field.value, label: "Seleccionado" }
                  : null);

              return (
                <SearchSelect
                  useOptions={useSupportStateOptions}
                  value={currentVal as any}
                  onChange={(opt) => {
                    field.onChange(opt ? Number(opt.value) : undefined);
                  }}
                  placeholder="Buscar estado..."
                  pageSize={10}
                  minSearchChars={0}
                  className="w-full min-w-0"
                />
              );
            }}
          />
          {errors.supportState && (
            <p className="mt-1 text-xs text-rose-600">{errors.supportState.message}</p>
          )}
        </div>

        {/* Fechas */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Fecha de Inicio</label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                value={field.value ?? ""}
                onChange={field.onChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Fecha de Expiración</label>
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                value={field.value ?? ""}
                onChange={field.onChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        {/* Comentarios */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Comentarios</label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <UpperTextarea
                value={field.value ?? ""}
                onValueChange={field.onChange}
                mode="none"
                placeholder="Comentarios adicionales..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
            )}
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Observaciones</label>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <UpperTextarea
                value={field.value ?? ""}
                onValueChange={field.onChange}
                mode="none"
                placeholder="Observaciones..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
            )}
          />
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
                <Save className="size-4" /> Guardar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
