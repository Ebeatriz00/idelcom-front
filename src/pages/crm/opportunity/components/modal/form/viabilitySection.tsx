import type {
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { FormStateValues } from "../changeState/form/shemaState";

type Props = {
  register: UseFormRegister<FormStateValues>;
  watch: UseFormWatch<FormStateValues>;
  totalCompliance: number;
  totalPartial: number;
  totalNoComp: number;
  disabled?: boolean;
  errors?: FieldErrors<FormStateValues>;
  touchedFields?: FieldNamesMarkedBoolean<FormStateValues>;
  submitCount?: number;
};

export function ViabilitySection({
  register,
  watch,
  totalCompliance,
  totalPartial,
  totalNoComp,
  disabled,
  errors,
  touchedFields,
  submitCount,
}: Props) {
  const viability = watch("viabilityScore");

  const isHiringRaw = watch("isHiring");
  const isHiring = isHiringRaw === true || Number(isHiringRaw as any) === 1;

  const isReEvaluationRaw = watch("isReEvaluation");
  const isReEvaluation =
    isReEvaluationRaw === true || Number(isReEvaluationRaw as any) === 1;

  const getErrorMessage = (fieldName: keyof FormStateValues) => {
    if (!errors) return undefined;
    return errors[fieldName]?.message as string | undefined;
  };
  const showError = (field: keyof FormStateValues) => {
    const touched = !!touchedFields?.[field];
    const submitted = (submitCount ?? 0) > 0;
    return touched || submitted;
  };

  return (
    <div className="space-y-6">
      {/* RESUMEN SUPERIOR */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-3
        "
      >
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold text-blue-600">CUMPLIMIENTO</p>
          <p className="text-2xl font-bold text-blue-700">{totalCompliance}</p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold text-amber-600">CUMPL. PARCIAL</p>
          <p className="text-2xl font-bold text-amber-700">{totalPartial}</p>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold text-red-600">NO CUMPLIMIENTO</p>
          <p className="text-2xl font-bold text-red-700">{totalNoComp}</p>
        </div>
      </div>

      {/* VIABILIDAD */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
        <p className="font-semibold text-green-700">VIABILIDAD</p>
        <p className="text-2xl font-bold text-green-700">
          {viability == null ? "—" : `${viability}%`}
        </p>
      </div>

      {/* TABLA */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="rounded-l-2xl px-4 py-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  CONDICIÓN
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase w-[170px]">
                  RPT
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase w-[320px]">
                  DETALLES
                </th>
                <th className="rounded-r-lg px-4 py-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  CONSIDERACIONES
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isReEvaluation && (
                <>
                  <tr className="bg-violet-50">
                    <td colSpan={4} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-violet-700 uppercase">
                          Técnicas
                        </span>
                        <span className="h-[1px] flex-1 bg-violet-200" />
                      </div>
                    </td>
                  </tr>
                  {/* ACERCAMIENTO CON MARCAS */}
                  <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                    <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                      <p>¿Se tiene acercamiento con las marcas?</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        {...register("brandAproach", {
                          required: "Selecciona una opción",
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      >
                        <option value="">—</option>
                        <option value={1}>SI</option>
                        <option value={2}>PARCIAL</option>
                        <option value={3}>NO</option>
                      </select>
                      {showError("brandAproach") &&
                        getErrorMessage("brandAproach") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("brandAproach")}
                          </p>
                        )}
                    </td>
                    <td className="p-2">
                      <textarea
                        {...register("brandAproachDesc")}
                        rows={2}
                        maxLength={100}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                      {showError("brandAproachDesc") &&
                        getErrorMessage("brandAproachDesc") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("brandAproachDesc")}
                          </p>
                        )}
                      {/* Contador de caracteres */}
                      <p className="text-[10px] text-slate-400 text-right">
                        {watch("brandAproachDesc")?.length ?? 0}/100
                      </p>
                    </td>

                    <td className="p-2 text-gray-500">
                      Considerar si se tiene contacto con las marcas
                    </td>
                  </tr>

                  {/* CAMBIOS EN EXPEDIENTE TECNICO */}
                  <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                    <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                      <p>¿Se puede hacer cambios en el expediente técnico?</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        {...register("TechnicalChanges", {
                          required: "Selecciona una opción",
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      >
                        <option value="">—</option>
                        <option value={1}>SI</option>
                        <option value={2}>PARCIAL</option>
                        <option value={3}>NO</option>
                      </select>
                      {showError("TechnicalChanges") &&
                        getErrorMessage("TechnicalChanges") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("TechnicalChanges")}
                          </p>
                        )}
                    </td>
                    <td className="p-2">
                      <textarea
                        {...register("TechnicalChangesDesc")}
                        rows={2}
                        maxLength={100}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                      {showError("TechnicalChangesDesc") &&
                        getErrorMessage("TechnicalChangesDesc") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("TechnicalChangesDesc")}
                          </p>
                        )}
                      {/* Contador de caracteres */}
                      <p className="text-[10px] text-slate-400 text-right">
                        {watch("TechnicalChangesDesc")?.length ?? 0}/100
                      </p>
                    </td>

                    <td className="p-2 text-gray-500">
                      Considerar si se pueden hacer modificaciones al expediente
                      técnico
                    </td>
                  </tr>
                </>
              )}
              {isHiring && (
                <>
                  <tr className="bg-violet-50">
                    <td colSpan={4} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-cyan-700 uppercase">
                          Contrataciones
                        </span>
                        <span className="h-[1px] flex-1 bg-violet-200" />
                      </div>
                    </td>
                  </tr>
                  {/*MODALIDAD DE CONTRATACION*/}
                  <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                    <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                      <p>Modalidad de contratación</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        {...register("contractMethod", {
                          required: "Selecciona una opción",
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                        disabled={disabled}
                      >
                        <option value="">—</option>
                        <option value={1}>
                          Ley de Contrataciones del Estado (Regular)
                        </option>
                        <option value={2}>Obras por Impuestos (OXI)</option>
                        <option value={3}>Decreto de Urgencia (DU)</option>
                        <option value={4}>BIRF / BID</option>
                        <option value={5}>Contratación Directa (8UIT)</option>
                        <option value={6}>Directiva Interna</option>
                        <option value={7}>Sub – Contratación </option>
                        <option value={7}>Contratación Privada</option>
                      </select>

                      {showError("contractMethod") &&
                        getErrorMessage("contractMethod") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("contractMethod")}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <textarea
                          {...register("contractMethodDesc")}
                          rows={2}
                          maxLength={100}
                          disabled={disabled}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                        />
                      </div>
                      {showError("contractMethodDesc") &&
                        getErrorMessage("contractMethodDesc") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("contractMethodDesc")}
                          </p>
                        )}
                      {/* Contador de caracteres */}
                      <p className="text-[10px] text-slate-400 text-right">
                        {watch("contractMethodDesc")?.length ?? 0}/100
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-[12px] text-slate-500">
                      Modalidad de contrato
                    </td>
                  </tr>

                  {/* ISOS */}
                  <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                    <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                      <p>Exige ISOS?</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        {...register("requiresIsos", {
                          required: "Selecciona una opción",
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        disabled={disabled}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      >
                        <option value="">—</option>
                        <option value={1}>SI</option>
                        <option value={2}>PARCIAL</option>
                        <option value={3}>NO</option>
                      </select>
                      {getErrorMessage("requiresIsos") && (
                        <p className="text-[10px] text-red-600 mt-1">
                          {getErrorMessage("requiresIsos")}
                        </p>
                      )}
                    </td>
                    <td className="p-2">
                      <textarea
                        {...register("requiresIsosDesc")}
                        rows={2}
                        maxLength={100}
                        disabled={disabled}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                      {showError("requiresIsosDesc") &&
                        getErrorMessage("requiresIsosDesc") && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {getErrorMessage("requiresIsosDesc")}
                          </p>
                        )}
                      {/* Contador de caracteres */}
                      <p className="text-[10px] text-slate-400 text-right">
                        {watch("requiresIsosDesc")?.length ?? 0}/100
                      </p>
                    </td>
                    <td className="p-2 text-gray-500">
                      Especificar las normas isos
                    </td>
                  </tr>
                </>
              )}
              {/* AUTORIDAD */}
              <tr className="bg-violet-50">
                <td colSpan={4} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-wide text-green-700 uppercase">
                      Viabilidad
                    </span>
                    <span className="h-[1px] flex-1 bg-violet-200" />
                  </div>
                </td>
              </tr>

              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>El Contacto es quien toma la decisión</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("authority", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                    disabled={disabled}
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("authority") && getErrorMessage("authority") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("authority")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-1">
                    <textarea
                      {...register("authorityDesc")}
                      rows={2}
                      maxLength={100}
                      disabled={disabled}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                    />
                  </div>
                  {showError("authorityDesc") &&
                    getErrorMessage("authorityDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("authorityDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("authorityDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="px-4 py-3 align-top text-[12px] text-slate-500">
                  Cargo del contacto
                </td>
              </tr>

              {/* PRESUPUESTO */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>El Cliente cuenta con presupuesto</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("budget", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("budget") && getErrorMessage("budget") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("budget")}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("budgetDesc")}
                    rows={2}
                    maxLength={100}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("budgetDesc") && getErrorMessage("budgetDesc") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("budgetDesc")}
                    </p>
                  )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("budgetDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Especificar presupuesto referencial
                </td>
              </tr>

              {/* NECESIDAD */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Es urgente resolver a la necesidad</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("need", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("need") && getErrorMessage("need") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("need")}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("needDesc")}
                    rows={2}
                    maxLength={100}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("needDesc") && getErrorMessage("needDesc") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("needDesc")}
                    </p>
                  )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("needDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Identificar si la solución resuelve un problema crítico
                </td>
              </tr>

              {/* PLAZO */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Tiempo estimado adjudicacion</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("term", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("term") && getErrorMessage("term") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("term")}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("termDesc")}
                    rows={2}
                    maxLength={100}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("termDesc") && getErrorMessage("termDesc") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("termDesc")}
                    </p>
                  )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("termDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Especificar fecha aprox. de adjudicación
                </td>
              </tr>

              {/* EXPERIENCIA - EMPRESA */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Cumplimos con la experiencia de Empresa</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("companyExperience", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("companyExperience") &&
                    getErrorMessage("companyExperience") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("companyExperience")}
                      </p>
                    )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("companyExperienceDesc")}
                    rows={2}
                    disabled={disabled}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("companyExperienceDesc") &&
                    getErrorMessage("companyExperienceDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("companyExperienceDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("companyExperienceDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Según lo solicitado por el alcance
                </td>
              </tr>

              {/* EXPERIENCIA - PERSONAL CLAVE */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Cumplimos con Personal Clave</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("workerExperience", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("workerExperience") &&
                    getErrorMessage("workerExperience") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("workerExperience")}
                      </p>
                    )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("workerExperienceDesc")}
                    rows={2}
                    maxLength={100}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("workerExperienceDesc") &&
                    getErrorMessage("workerExperienceDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("workerExperienceDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("workerExperienceDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Según lo solicitado por el alcance
                </td>
              </tr>

              {/* EXPERIENCIA - TRABAJOS SIMILARES */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Hemos realizado trabajos similares</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("staffExperience", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("staffExperience") &&
                    getErrorMessage("staffExperience") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("staffExperience")}
                      </p>
                    )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("staffExperienceDesc")}
                    rows={2}
                    disabled={disabled}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("staffExperienceDesc") &&
                    getErrorMessage("staffExperienceDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("staffExperienceDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("staffExperienceDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Indicar experiencia anterior
                </td>
              </tr>

              {/* CAPACIDAD */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Contamos con capacidad financiera?</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("ability", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("ability") && getErrorMessage("ability") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("ability")}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("abilityDesc")}
                    rows={2}
                    maxLength={100}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("abilityDesc") &&
                    getErrorMessage("abilityDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("abilityDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("abilityDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Contamos con capacidad económica
                </td>
              </tr>

              {/* CRONOGRAMA */}
              <tr className="border-t border-slate-100 odd:bg-slate-50/40 hover:bg-sky-50/60 transition-colors">
                <td className="px-4 py-3 align-top text-[13px] text-slate-700">
                  <p>Se puede cumplir con el control del cronograma?</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    {...register("shedule", {
                      required: "Selecciona una opción",
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  >
                    <option value="">—</option>
                    <option value={1}>SI</option>
                    <option value={2}>PARCIAL</option>
                    <option value={3}>NO</option>
                  </select>

                  {showError("shedule") && getErrorMessage("shedule") && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {getErrorMessage("shedule")}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <textarea
                    {...register("sheduleDesc")}
                    disabled={disabled}
                    rows={2}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  {showError("sheduleDesc") &&
                    getErrorMessage("sheduleDesc") && (
                      <p className="text-[10px] text-red-600 mt-1">
                        {getErrorMessage("sheduleDesc")}
                      </p>
                    )}
                  {/* Contador de caracteres */}
                  <p className="text-[10px] text-slate-400 text-right">
                    {watch("sheduleDesc")?.length ?? 0}/100
                  </p>
                </td>
                <td className="p-2 text-gray-500">
                  Considerar si se cumplen los plazos establecidos según el
                  cronograma
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
