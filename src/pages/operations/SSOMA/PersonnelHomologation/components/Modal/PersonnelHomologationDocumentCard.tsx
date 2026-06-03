import type {
  OptionItem,
  PersonnelOperationsByWorkerItemDto,
} from "@/application";
import { SearchSelect, UpperTextarea, type UseOptionsHook } from "@/layouts";
import { useRequirementSpecifications } from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";
import { Trash2, FileText, Calendar, Clock, AlertCircle, CheckCircle2, RotateCw, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import {
  calculateExpirationDate,
  resolveRequirementDuration,
} from "../../utils/helper";
import type { PersonnelHomologationFormValues } from "../../utils/personnelHomologation.schema";
import { PersonnelDocumentDropzone } from "../Dropzone/PersonnelDocumentDropzone";
import {
  inputClass,
  labelClass,
  textareaClass,
} from "./PersonnelHomologationForm.shared";

type Props = {
  index: number;
  control: Control<PersonnelHomologationFormValues>;
  errors: FieldErrors<PersonnelHomologationFormValues>;
  register: UseFormRegister<PersonnelHomologationFormValues>;
  setValue: UseFormSetValue<PersonnelHomologationFormValues>;
  watch: UseFormWatch<PersonnelHomologationFormValues>;
  onRemove: (index: number) => void;
  requirementLabel?: string;
  requirementOptions: OptionItem[];
  operationRequirementOptions: OptionItem[];
  useRequirementSearchOptions: UseOptionsHook;
  operationRequirementsConfig: PersonnelOperationsByWorkerItemDto[];
  workerName?: string;
  operationLabel?: string;
  homologationScopeId?: number;
  workerId?: number;
};

export function PersonnelHomologationDocumentCard({
  index,
  control,
  errors,
  register,
  setValue,
  watch,
  onRemove,
  requirementOptions,
  operationRequirementOptions,
  useRequirementSearchOptions,
  operationRequirementsConfig,
  workerName,
  operationLabel,
  homologationScopeId,
}: Props) {
  const currentRequirementId = watch(`documents.${index}.requirementId`);
  const currentIssueDate = watch(`documents.${index}.issueDate`);
  const currentExpirationDate = watch(`documents.${index}.expirationDate`);
  const currentFileName = watch(`documents.${index}.fileName`);
  const currentFileUrl = watch(`documents.${index}.fileUrl`);
  const currentFilePath = watch(`documents.${index}.filePath`);
  const currentLocalUploadToken = watch(`documents.${index}.localUploadToken`);

  const isGeneralScope = Number(homologationScopeId) === 1;

  const { data: generalRequirementData } = useRequirementSpecifications(
    Number(currentRequirementId),
    { enabled: isGeneralScope && Boolean(currentRequirementId) },
  );

  const requirementConfig = useMemo(() => {
    if (isGeneralScope) return generalRequirementData ?? null;
    if (!Array.isArray(operationRequirementsConfig)) return null;
    return (
      operationRequirementsConfig.find(
        (x) => Number(x.requirementId) === Number(currentRequirementId),
      ) ?? null
    );
  }, [
    isGeneralScope,
    generalRequirementData,
    operationRequirementsConfig,
    currentRequirementId,
  ]);

  const optionFromLists = useMemo(
    () =>
      requirementOptions.find((option) => Number(option.value) === Number(currentRequirementId)) ??
      operationRequirementOptions.find((option) => Number(option.value) === Number(currentRequirementId)) ??
      null,
    [currentRequirementId, operationRequirementOptions, requirementOptions],
  );

  const [selectedRequirementOpt, setSelectedRequirementOpt] = useState<OptionItem | null>(optionFromLists);

  useEffect(() => {
    if (!currentRequirementId) {
      setSelectedRequirementOpt(null);
      return;
    }
    if (selectedRequirementOpt && Number(selectedRequirementOpt.value) === Number(currentRequirementId)) return;
    setSelectedRequirementOpt(optionFromLists);
  }, [currentRequirementId, optionFromLists, selectedRequirementOpt]);

  const selectedRequirementOption =
    selectedRequirementOpt && Number(selectedRequirementOpt.value) === Number(currentRequirementId)
      ? selectedRequirementOpt
      : optionFromLists;

  const requirementName = selectedRequirementOption?.label ?? requirementConfig?.requirementName;
  const todayDate = new Date().toISOString().slice(0, 10);

  // Lógica de Autocalcular Vencimiento: Priorizamos la duración del config (que viene de la lista por trabajador en proyectos)
  useEffect(() => {
    const duration = resolveRequirementDuration(
      (requirementConfig as any)?.duration,
      (requirementConfig as any)?.requerimentDuration,
    );
    if (duration > 0 && currentIssueDate && !currentExpirationDate) {
      try {
        const nextExpiration = calculateExpirationDate(currentIssueDate, duration);
        if (nextExpiration) {
          setValue(`documents.${index}.expirationDate`, nextExpiration, {
            shouldDirty: true,
            shouldValidate: true
          });
        }
      } catch (e) {
        console.error("Error al calcular vigencia", e);
      }
    }
  }, [currentIssueDate, requirementConfig, currentExpirationDate, index, setValue]);

  // Identificar si es un documento sensible (Punto 4)
  const isSensitive = useMemo(() => {
    const name = (requirementName || "").toUpperCase();
    return name.includes("MÉDICO") || name.includes("DNI") || name.includes("ANTECEDENTES") || name.includes("SALUD");
  }, [requirementName]);

  const isDropzoneDisabled = !currentRequirementId;
  const hasFile = Boolean(currentRequirementId) && Boolean(currentFileName);
  const isComplete = hasFile && !currentLocalUploadToken;
  const isReadyToSave = hasFile && Boolean(currentLocalUploadToken);

  return (
    <div className={[
      "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300",
      isComplete 
        ? "border-emerald-200 bg-white shadow-sm" 
        : "border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md"
    ].join(" ")}>
      
      {/* Header de la Card */}
      <div className={[
        "flex items-center justify-between border-b px-5 py-4 transition-colors",
        isComplete ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50"
      ].join(" ")}>
        <div className="flex items-center gap-3">
          <div className={[
            "flex size-10 items-center justify-center rounded-xl shadow-sm ring-1",
            isComplete 
              ? "bg-emerald-100 text-emerald-600 ring-emerald-200" 
              : "bg-white text-slate-400 ring-slate-200 group-hover:text-blue-500 group-hover:ring-blue-200"
          ].join(" ")}>
            <FileText className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Documento {index + 1}</span>
               {isComplete ? (
                 <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                    <CheckCircle2 className="size-3" /> Completo
                 </span>
               ) : isReadyToSave ? (
                 <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                    <Clock className="size-3" /> Listo para guardar
                 </span>
               ) : (
                 <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                    <Clock className="size-3" /> Pendiente
                 </span>
               )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <p className="text-sm font-bold text-slate-800">
                 {requirementName || "Nuevo Requisito"}
               </p>
               {isSensitive && (
                 <span className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 ring-1 ring-inset ring-rose-200">
                    <ShieldAlert className="size-3" /> Confidencial
                 </span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasFile && (
            <button
              type="button"
              onClick={() => {
                // Para activar el reemplazo, simplemente limpiamos los datos del archivo
                // pero mantenemos el requisito, forzando al usuario a subir uno nuevo.
                setValue(`documents.${index}.fileName`, "", { shouldDirty: true, shouldValidate: true });
                setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true, shouldValidate: true });
                setValue(`documents.${index}.filePath`, "", { shouldDirty: true, shouldValidate: true });
                setValue(`documents.${index}.localUploadToken`, `${Date.now()}`, { shouldDirty: true, shouldValidate: false });
              }}
              className="inline-flex size-9 items-center justify-center rounded-xl text-blue-500 transition-colors hover:bg-blue-50"
              title="Reemplazar archivo"
            >
              <RotateCw className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Eliminar documento"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_auto_1.2fr]">
        {/* Lado Izquierdo: Configuración */}
        <div className="p-5 space-y-5">
          <div>
            <label className={[labelClass, "flex items-center gap-2"].join(" ")}>
               Selección del Requisito
            </label>
            <Controller
              name={`documents.${index}.requirementId`}
              control={control}
              render={({ field }) => (
                <SearchSelect
                  useOptions={useRequirementSearchOptions}
                  value={selectedRequirementOption}
                  onChange={(opt) => {
                    setSelectedRequirementOpt(opt);
                    field.onChange(opt ? Number(opt.value) : undefined);
                    setValue(`documents.${index}.fileName`, "", { shouldDirty: true, shouldValidate: true });
                    setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true, shouldValidate: true });
                    setValue(`documents.${index}.filePath`, "", { shouldDirty: true, shouldValidate: true });
                    setValue(`documents.${index}.localUploadToken`, "", { shouldDirty: true, shouldValidate: false });
                  }}
                  placeholder="Escribe para buscar un requisito..."
                  pageSize={10}
                  className="w-full"
                />
              )}
            />
            {errors.documents?.[index]?.requirementId && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errors.documents[index]?.requirementId?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Emisión</label>
              <div className="relative">
                <input
                  type="date"
                  className={[inputClass, "pl-9"].join(" ")}
                  {...register(`documents.${index}.issueDate`)}
                />
                <Calendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.documents?.[index]?.issueDate && (
                <p className="mt-1.5 text-[10px] font-medium text-rose-600">
                  {errors.documents[index]?.issueDate?.message}
                </p>
              )}
            </div>

            {requirementConfig?.requiresExpiration !== false ? (
              <div>
                <label className={labelClass}>Vencimiento</label>
                <div className="relative">
                  <input
                    type="date"
                    className={[inputClass, "pl-9"].join(" ")}
                    {...register(`documents.${index}.expirationDate`)}
                  />
                  <Clock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.documents?.[index]?.expirationDate && (
                  <p className="mt-1.5 text-[10px] font-medium text-rose-600">
                    {errors.documents[index]?.expirationDate?.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-end pb-2">
                 <span className="text-[11px] font-medium text-slate-400 italic">No requiere vencimiento</span>
              </div>
            )}
          </div>

          <div>
             <label className={labelClass}>Observación (Opcional)</label>
             <Controller
               name={`documents.${index}.observation`}
               control={control}
               render={({ field }) => (
                 <UpperTextarea
                   value={field.value ?? ""}
                   onValueChange={field.onChange}
                   rows={2}
                   placeholder="Detalles sobre el documento..."
                   className={[textareaClass, "text-xs"].join(" ")}
                 />
               )}
             />
          </div>
        </div>

        {/* Divisor Vertical */}
        <div className="hidden w-px bg-slate-100 lg:block" />

        {/* Lado Derecho: Dropzone y Metadata */}
        <div className="bg-slate-50/50 p-5">
          <div className="mb-3 flex items-center justify-between">
             <label className={labelClass}>Carga de Archivo</label>
             {requirementConfig && (
               <div className="flex gap-1.5">
                  {requirementConfig.requiresExpiration && (
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-inset ring-amber-200" title="Requiere fecha de vencimiento">
                       EXP
                    </span>
                  )}
                  {requirementConfig.requiresFile && (
                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-inset ring-blue-200" title="Requiere archivo adjunto">
                       FILE
                    </span>
                  )}
               </div>
             )}
          </div>

          <PersonnelDocumentDropzone
            requirement={requirementConfig}
            requirementName={requirementName}
            issueDate={currentIssueDate}
            expirationDate={currentExpirationDate}
            workerName={workerName}
            operationLabel={operationLabel}
            homologationScopeId={homologationScopeId}
            disabled={isDropzoneDisabled}
            value={
              currentFileName
                ? {
                    fileName: currentFileName,
                    fileUrl: currentFileUrl ?? "",
                    filePath: currentFilePath ?? "",
                  }
                : null
            }
            onUploaded={(file) => {
              setValue(`documents.${index}.fileName`, file.fileName, { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.fileUrl`, file.fileUrl, { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.filePath`, file.filePath, { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.localUploadToken`, `${Date.now()}`, { shouldDirty: true, shouldValidate: false });
              setValue(`documents.${index}.file`, file.rawFile, { shouldDirty: true, shouldValidate: false });
              if (!currentIssueDate) {
                setValue(`documents.${index}.issueDate`, todayDate, { shouldDirty: true, shouldValidate: true });
              }
            }}
            onRemove={() => {
              setValue(`documents.${index}.fileName`, "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.filePath`, "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.localUploadToken`, "", { shouldDirty: true, shouldValidate: false });
              setValue(`documents.${index}.file`, undefined, { shouldDirty: true, shouldValidate: false });
            }}
            onUseInternal={() => {
              if (!requirementConfig) return;
              setValue(`documents.${index}.fileName`, requirementConfig.internalFileName ?? "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.fileUrl`, requirementConfig.internalFileUrl ?? "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.filePath`, requirementConfig.internalFilePath ?? "", { shouldDirty: true, shouldValidate: true });
              setValue(`documents.${index}.localUploadToken`, `${Date.now()}`, { shouldDirty: true, shouldValidate: false });
              if (requirementConfig.internalIssueDate) {
                setValue(`documents.${index}.issueDate`, requirementConfig.internalIssueDate, { shouldDirty: true, shouldValidate: true });
              }
              if (requirementConfig.internalExpirationDate) {
                setValue(`documents.${index}.expirationDate`, requirementConfig.internalExpirationDate, { shouldDirty: true, shouldValidate: true });
              }
            }}
          />

          {(errors.documents?.[index]?.fileName || errors.documents?.[index]?.filePath) && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600 ring-1 ring-inset ring-rose-200">
               <AlertCircle className="size-3.5 shrink-0" />
               <p>{errors.documents?.[index]?.fileName?.message || errors.documents?.[index]?.filePath?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
