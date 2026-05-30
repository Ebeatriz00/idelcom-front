import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { SearchSelect } from "@/layouts";
import { useLicStatusOptions } from "@/sharedKernel/hooks/licstatus/useLicStatus";
import { localFileUrl, uploadByArchiveType } from "@/sharedKernel";

import {
  OpporHiringFilesSection,
  type PendingHiringFile,
  type ExistingHiringFile
} from "../../opportunity/components/modal/deliverablesHiring/opporHiringFilesSection";

export type HiringFileUploaded = {
  fileTitle: string;
  fileUrl: string;
  relativePath: string;
  archiveType: string;
};

type FormValues = {
  hiringId: number;
  licStatusId: number;
  hiringFiles?: any;
};

interface Props {
  defaultValues: FormValues;
  onSubmit: (data: FormValues, files?: HiringFileUploaded[]) => void;
  onCancel: () => void;
  saving: boolean;
  currentStateLabel?: string;
  opporNumber: string;
  existingFiles?: ExistingHiringFile[];
  requestNote?: string;

  preSalesId?: number | null;
  typeObsClients?: number | null; 
  affects?: number | null;
  opporStateId?: number | null;
}

export function HiringChangeStateForm({
  defaultValues,
  onSubmit,
  onCancel,
  saving,
  currentStateLabel,
  opporNumber,

  //existingFiles = [],
  requestNote,
  
  preSalesId,
  typeObsClients, 
  affects,
  opporStateId

}: Props) {

  const [pendingFiles, setPendingFiles] = useState<PendingHiringFile[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues
  });

  const { data: stateResp } = useLicStatusOptions();
  const stateOptions = stateResp?.items ?? [];

  const currentSelectedStatus = watch("licStatusId");
  const isDelivered = Number(currentSelectedStatus) === 4;
  const showObservation = requestNote && Number(currentSelectedStatus) === 3;

  useEffect(() => {
    if (pendingFiles.length > 0) {
      clearErrors("hiringFiles");
    }
  }, [pendingFiles, clearErrors]);

  const handleFormSubmit = async (values: FormValues) => {
    let hasErrors = false;

    if (Number(values.licStatusId) === 4) { 
      const statusErrors: string[] = [];
      const currentStatus = Number(defaultValues.licStatusId);

      if (Number(opporStateId) === 8) {
          if (currentStatus === 2 || currentStatus === 3) {
              
              if (Number(affects) === 1) {
                  const isTypeOk = Number(typeObsClients) === 1;
                  const isPreSalesOk = Number(preSalesId) === 4;

                  if (!isTypeOk || !isPreSalesOk) {
                     let msg = "Requisitos no cumplidos:";
                     
                     if (!isTypeOk) msg += " Tipo Obs. Clientes incorrecto (Debe ser 1).";
                     if (!isPreSalesOk) msg += "Estado de Pre-Venta pendiente.";
                     
                     statusErrors.push(msg);
                  }
              }
          }
      }

      if (statusErrors.length > 0) {
        setError("licStatusId", {
          type: "custom",
          message: statusErrors.join(" ") 
        });
        hasErrors = true;
      }

      if (pendingFiles.length === 0) {
        setError("hiringFiles", {
          type: "custom",
          message: "Debes subir al menos un archivo para cambiar al estado Entregado."
        });
        hasErrors = true;
      } else {
          const hasMissingDestination = pendingFiles.some(f => !f.destination || (f.destination as string) === "");
          if (hasMissingDestination) {
            setError("hiringFiles", {
              type: "custom",
              message: "Debes seleccionar una carpeta de destino para todos los archivos."
            });
            hasErrors = true;
          } else {
            clearErrors("hiringFiles");
          }
      }
    }

    if (hasErrors) return;

    let uploadedFiles: HiringFileUploaded[] | undefined = undefined;

    if (isDelivered) {
      try {
        const rootFolderName = "OPORTUNIDADES";
        const year = String(new Date().getFullYear());
        const baseSegments: string[] = [year, rootFolderName];

        uploadedFiles = await Promise.all(
          pendingFiles.map(async (pendingItem) => {
            const destination = pendingItem.destination!; 

            const folderKey = destination === "DOCUMENTACION"
                ? "CONTRATACIONES/DOCUMENTACION"
                : "CONTRATACIONES/INFORMES";

            const up = await uploadByArchiveType(
              pendingItem.file,
              opporNumber,
              folderKey,
              { strategy: "same", baseSegments },
            );

            return {
              fileTitle: up.fileName,
              fileUrl: localFileUrl(up.relativePath),
              relativePath: up.relativePath,
              archiveType: destination
            };
          })
        );
      } catch (error) {
        console.error("Error subiendo archivos", error);
        alert("Ocurrió un error al subir los archivos.");
        return;
      }
    }

    onSubmit(values, uploadedFiles);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nuevo Estado
        </label>
        <Controller
          name="licStatusId"
          control={control}
          rules={{ required: "Debes seleccionar un estado" }}
          render={({ field: { value, onChange }, fieldState }) => (
            <>
              <SearchSelect
                useOptions={() => ({ data: { items: stateOptions } } as any)}
                value={
                    stateOptions.find((o) => Number(o.value) === value) ||
                    (value ? { value, label: currentStateLabel || "Estado Actual" } : null)
                }
                onChange={(opt: any) => {
                   const newValue = opt ? Number(opt.value) : undefined;
                   onChange(newValue);
                   
                   if (fieldState.error) clearErrors("licStatusId");

                   if(newValue !== 4) {
                     setPendingFiles([]);
                     clearErrors("hiringFiles");
                   }
                }}
                placeholder="Seleccione el nuevo estado..."
                disabled={saving}
                className="w-full"
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {isDelivered && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Adjuntar Archivos
            </label>

            <OpporHiringFilesSection
              files={pendingFiles}
              onChange={setPendingFiles}
              disabled={saving}
              showDestinationSelect={true}

              error={errors.hiringFiles as any}
              defaultDestination={undefined} 
            />
        </div>
      )}

      {showObservation && (
        <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mt-4">
           <div className="flex">
             <div className="ml-3">
               <h3 className="text-sm font-medium text-amber-800">
                 Motivo de la observación
               </h3>
               <div className="mt-2 text-sm text-amber-700">
                 <p>{requestNote}</p>
               </div>
             </div>
           </div>
         </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 shadow-sm"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
