import { Modal, useModalHistoryLock } from "@/layouts";
import { usePersonnelHomologationForm } from "../../hooks/usePersonnelHomologationForm";
import type { PropsForm } from "../../utils/TypesPersonnel";
import { PersonnelHomologationDocumentsSection } from "./PersonnelHomologationDocumentsSection";
import { PersonnelHomologationGeneralSection } from "./PersonnelHomologationGeneralSection";
import { PersonnelHomologationHeader } from "./PersonnelHomologationHeader";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { deleteLocalFile } from "@/sharedKernel";
import type { PersonnelHomologationFormValues } from "../../utils/personnelHomologation.schema";
import { mapToRequestDto } from "../../utils/personnelHomologation.mapToFormValues";

export function PersonnelHomologationFormModal({
  open = false,
  workerName,
  workerId,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
}: PropsForm) {
  useModalHistoryLock(open, onClose ?? (() => {}));

  const formState = usePersonnelHomologationForm({
    defaultValues,
    onSubmit,
    workerId,
  });
  const isSubmittedRef = useRef(false);
  const [attemptedInvalidSubmit, setAttemptedInvalidSubmit] = useState(false);

  const {
      form: {
        control,
        register,
        watch,
        setValue,
        reset,
        getValues,
        formState: { errors, isDirty, isValid },
      },
    fieldArray: { fields, append, remove },
    state,
    queries,
    methods,
  } = formState;

  // Lógica de limpieza al cerrar (Cleanup)
  useEffect(() => {
    if (open) {
      isSubmittedRef.current = false;
      setAttemptedInvalidSubmit(false);
    }

    return () => {
      // Si el modal se cierra y NO fue por un submit exitoso
      if (!open && !isSubmittedRef.current) {
        const docs = getValues("documents") || [];
        docs.forEach((doc: any) => {
          if (doc.filePath && doc.fileName) {
            void deleteLocalFile(doc.filePath);
          }
        });
        reset();
      }
    };
  }, [open, getValues, reset]);

  const handleFormSubmit = async (values: PersonnelHomologationFormValues) => {
    isSubmittedRef.current = true;
    setAttemptedInvalidSubmit(false);
    await onSubmit(mapToRequestDto(values));
  };

  const handleInvalidSubmit = (
    invalidErrors: FieldErrors<PersonnelHomologationFormValues>,
  ) => {
    setAttemptedInvalidSubmit(true);
    console.error(
      "[SSOMA][PersonnelHomologationForm] No se puede registrar. Errores de validacion:",
      invalidErrors,
    );
  };

  if (!open) return null;

  const formId = "personnel-homologation-form";

  // Botón deshabilitado si no hay cambios, si ya se está guardando, si está cargando el detalle o si el form es inválido
  const hasPendingSave = isDirty || state.readyDocs > 0;
  const isSaveDisabled = !hasPendingSave || saving || loadingDetail;

  return (
    <Modal
      size="full"
      onClose={onClose}
      footer={
        <>
          <div className="flex flex-1 items-center gap-4">
            {attemptedInvalidSubmit && !isValid && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200 animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="size-3.5" />
                <span>Para guardar: completa todos los archivos y fechas obligatorias.</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSaveDisabled}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold text-white shadow-sm transition-all",
                isSaveDisabled
                  ? "bg-slate-200 cursor-not-allowed text-slate-400"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95"
              ].join(" ")}
            >
              {saving ? (
                <><span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Guardando...</>
              ) : "Guardar cambios"}
            </button>
          </div>
        </>
      }
    >
      {loadingDetail ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-slate-500">
           <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500 mb-4" />
           <p className="text-sm font-medium">Cargando información del trabajador...</p>
        </div>
      ) : (
        <form
          id={formId}
          onSubmit={formState.form.handleSubmit(handleFormSubmit, handleInvalidSubmit)}
          className="space-y-6"
        >
          <div className="sticky top-[-1px] z-20 -mx-5 -mt-2 border-b border-slate-200 bg-white px-5 py-4">
            <PersonnelHomologationHeader
              workerName={workerName}
              isOperationScope={state.isOperationScope}
              completedDocs={state.completedDocs}
              readyDocs={state.readyDocs}
              totalDocs={fields.length}
            />
          </div>

          <PersonnelHomologationGeneralSection
            control={control}
            errors={errors}
            isOperationScope={state.isOperationScope}
            isScopeDisabled={state.hasUploadedDocuments}
            ssomaApproved={state.ssomaApproved}
            register={register}
            operationOptions={queries.operationOptions}
            operationOptionsLoading={queries.operationOptionsLoading}
            medicalAptitudeSummary={state.medicalAptitudeSummary}
            showMedicalAptitude={state.showMedicalAptitude}
            medicalAptitudeOptions={queries.medicalAptitudeOptions}
          />

          <PersonnelHomologationDocumentsSection
            completedDocs={state.completedDocs}
            readyDocs={state.readyDocs}
            homologationScopeId={Number(state.homologationScopeId ?? 0)}
            canAddDocuments={state.canAddDocuments}
            fields={fields}
            shouldLoadByWorkerRequirements={state.shouldLoadByWorkerRequirements}
            byWorkerLoading={queries.byWorkerLoading}
            onAppend={append}
            onRemove={remove}
            workerName={workerName}
            operationLabel={state.operationLabel}
            documentCardProps={{
              control,
              errors,
              register,
              setValue,
              watch,
              requirementLabel: "Requisito",
              requirementOptions: queries.requirementOptions,
              operationRequirementOptions: queries.operationRequirementOptions,
              useRequirementSearchOptions: methods.useRequirementSearchOptions,
              operationRequirementsConfig: queries.operationsRequirementsByWorker,
            }}
          />
        </form>
      )}
    </Modal>
  );
}
