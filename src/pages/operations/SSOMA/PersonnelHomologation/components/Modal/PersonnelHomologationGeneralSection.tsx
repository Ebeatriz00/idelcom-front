import type { OptionItem } from "@/application";
import { UpperTextarea } from "@/layouts";
import { ShieldCheck, Calendar, Info, Briefcase, FileCheck } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import type { PersonnelHomologationFormValues } from "../../utils/personnelHomologation.schema";
import {
  inputClass,
  labelClass,
  textareaClass,
} from "./PersonnelHomologationForm.shared";

type Props = {
  control: Control<PersonnelHomologationFormValues>;
  errors: FieldErrors<PersonnelHomologationFormValues>;
  isOperationScope: boolean;
  isScopeDisabled?: boolean;
  ssomaApproved?: boolean;
  register: UseFormRegister<PersonnelHomologationFormValues>;
  operationOptions: OptionItem[];
  operationOptionsLoading: boolean;
  medicalAptitudeSummary?: string | null;
  showMedicalAptitude?: boolean;
  medicalAptitudeOptions?: OptionItem[];
};

export function PersonnelHomologationGeneralSection({
  control,
  errors,
  isOperationScope,
  isScopeDisabled = false,
  ssomaApproved,
  register,
  operationOptions,
  operationOptionsLoading,
  medicalAptitudeSummary,
  showMedicalAptitude,
  medicalAptitudeOptions = [],
}: Props) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
           <Briefcase className="size-4" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Configuración principal</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <input
          type="hidden"
          {...register("homologationPersonnel.workerId", {
            setValueAs: (value) =>
              value === "" || value == null ? undefined : Number(value),
          })}
        />

        {/* Card: Tipo y Alcance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
           <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                 <FileCheck className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-800">Alcance</span>
           </div>

           <div className="space-y-4">
              <div>
                <label className={labelClass}>Tipo de homologación</label>
                <div className="group relative">
                  <select
                    disabled={isScopeDisabled}
                    className={[
                      inputClass,
                      isScopeDisabled ? "cursor-not-allowed opacity-60 bg-slate-50" : "",
                      "transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    ].join(" ")}
                    {...register("homologationPersonnel.homologationScopeId", {
                      setValueAs: (value) =>
                        value === "" || value == null ? undefined : Number(value),
                    })}
                  >
                    <option value="">Seleccione</option>
                    <option value="1">General</option>
                    <option value="2">Proyectos</option>
                  </select>

                  {isScopeDisabled && (
                    <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100">
                      No se puede cambiar el tipo si ya hay documentos subidos
                    </div>
                  )}
                </div>
                {errors.homologationPersonnel?.homologationScopeId && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.homologationPersonnel.homologationScopeId.message}
                  </p>
                )}
              </div>

              {isOperationScope && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClass}>Proyecto / Operación</label>

                  <Controller
                    name="homologationPersonnel.operationsId"
                    control={control}
                    render={({ field }) => (
                      <div className="group relative">
                        <select
                          disabled={isScopeDisabled}
                          className={[
                            inputClass,
                            isScopeDisabled ? "cursor-not-allowed opacity-60 bg-slate-50" : "",
                            "transition-all duration-200"
                          ].join(" ")}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const rawValue = event.target.value;
                            const nextValue =
                              rawValue === "" ? undefined : Number(rawValue);

                            field.onChange(nextValue);
                          }}
                        >
                          <option value="">Seleccione</option>
                          {Array.isArray(operationOptions) && operationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {isScopeDisabled && (
                          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100">
                            No se puede cambiar la operación si ya hay documentos subidos
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {errors.homologationPersonnel?.operationsId && (
                    <p className="mt-1.5 text-xs text-rose-600">
                      {errors.homologationPersonnel.operationsId.message}
                    </p>
                  )}

                  {operationOptionsLoading && (
                    <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                      Cargando operaciones...
                    </p>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* Card: Fechas y Vigencia */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
           <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                 <Calendar className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-800">Vigencia</span>
           </div>

           <div className="space-y-4">
              <div>
                <label className={labelClass}>Vigencia desde</label>
                <div className="relative">
                  <input
                    type="date"
                    className={[inputClass, "pl-10"].join(" ")}
                    {...register("homologationPersonnel.validFrom")}
                  />
                  <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.homologationPersonnel?.validFrom && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.homologationPersonnel.validFrom.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vigencia final estimada
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600 italic">
                  Calculado automáticamente al guardar
                </p>
              </div>
           </div>
        </div>

        {/* Card: Aptitud y Validación */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md lg:col-span-1">
           <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                 <ShieldCheck className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-800">Estado SSOMA</span>
           </div>

           <div className="space-y-4">
              {showMedicalAptitude && (
                <div>
                  <label className={labelClass}>Aptitud Médica</label>
                  <Controller
                    name="homologationPersonnel.medicalAptitudeId"
                    control={control}
                    render={({ field }) => (
                      <select
                        className={inputClass}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      >
                        <option value="">Seleccione</option>
                        {medicalAptitudeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.homologationPersonnel?.medicalAptitudeId && (
                    <p className="mt-1.5 text-xs text-rose-600">
                      {errors.homologationPersonnel.medicalAptitudeId.message}
                    </p>
                  )}
                </div>
              )}

              <div
                className={[
                  "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                  ssomaApproved
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-100 bg-slate-50/30 hover:bg-slate-50",
                ].join(" ")}
              >
                <input
                  id="ssomaApproved"
                  type="checkbox"
                  className="mt-1 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  {...register("homologationPersonnel.ssomaApproved")}
                />
                <label htmlFor="ssomaApproved" className="cursor-pointer select-none">
                   <p className="text-xs font-bold text-slate-800">Aprobado por SSOMA</p>
                   <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                      Confirmar validación técnica del personal.
                   </p>
                </label>
              </div>
           </div>
        </div>

        {/* Resumen de Aptitud Médica (si existe) */}
        {isOperationScope && medicalAptitudeSummary && (
          <div className="animate-in zoom-in-95 duration-500 md:col-span-2 lg:col-span-3">
            <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/30 p-4 ring-1 ring-blue-100/50">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                <Info className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
                  Resumen de Aptitud Médica
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-blue-900">
                  {medicalAptitudeSummary}
                </p>
                <p className="mt-1.5 text-xs font-medium text-blue-600/70">
                  Dato informativo basado en el último certificado registrado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className={[labelClass, "flex items-center gap-2"].join(" ")}>
             Notas y Observaciones
          </label>
          <Controller
            name="homologationPersonnel.notes"
            control={control}
            render={({ field }) => (
              <UpperTextarea
                value={field.value ?? ""}
                onValueChange={field.onChange}
                rows={3}
                placeholder="Ingresa cualquier detalle adicional relevante para esta homologación..."
                className={[
                  textareaClass,
                  "bg-white shadow-sm ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-blue-500/20"
                ].join(" ")}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
}
