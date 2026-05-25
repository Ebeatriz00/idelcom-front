import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react"; 
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { validateQuotationExcel } from "@/infrastructure";
import { RHFSearchSelect } from "./detail/modal/form/RHFSearchSelect";
import type { ProjectsUpdateStatusDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import { useStatePreSaleOptions } from "@/sharedKernel/hooks/stpresale/useStatePreSale";

import { uploadByArchiveType } from "@/sharedKernel";

import { 
  useProjectObservationList,
  useProjectObservationProjectList 
} from "@/sharedKernel/hooks/observations/useObservations"; 
import { ProjectObservationStager } from "./ProjectObservationStager";
import { ProjectTeamManager } from "./ProjectTeamManager";
import { type FileDestinationOption, type PendingHiringFile, OpporHiringFilesSection } from "@/pages/crm/opportunity/components/modal/deliverablesHiring/opporHiringFilesSection";

const PRE_SALE_FILE_OPTIONS: FileDestinationOption[] = [
  { label: "Oferta", value: "TECNICA" },
  { label: "Información Cliente", value: "CLIENTS" },
  { label: "O.C. Proveedores", value: "O.C. PROVEEDORES" }
];

const ID_DESARROLLO = 2;
const ID_ENTREGADO = 4;
const ID_OBSERVADO = 8;
const SEVERITY_URGENT = 1;
const SEVERITY_NORMAL = 3;

const OBS_TYPE_GENERAL = 1;   
const OBS_TYPE_CONTRACT = 2; 
const OBS_STATUS_COMPLETED = 7;
const QUOTATION_VALIDATION_FOLDER_KEYS = new Set([
  "PRESUPUESTAL/CLIENTES",
  "PREVENTA/TECNICA",
]);

const schema = z.object({
    linkToken: z.string().optional(),
    businessId: z.number().optional(), 
    statePreSaleId: z.number({ required_error: "El estado es requerido" }),
    obsReason: z.array(z.string()).optional(), 
    assignedWorkerId: z.array(z.number()).optional(),
    obsSeverity: z.number().optional(),
    obsType: z.number().optional(),
    obsStatusId: z.number().optional(),
    projectFiles: z.any().optional(),
  });

type FormValues = z.infer<typeof schema>;

export type ProjectFileUploaded = {
  fileTitle: string;
  fileUrl: string;
  relativePath: string;
  archiveType: string;
};

function getPreSaleFolderKey(dest: string) {
  if (dest === "CLIENTES") return "PRESUPUESTAL/CLIENTES";
  if (dest === "LOGISTICA") return "LOGISTICA";
  if (dest === "TECNICA") return "PREVENTA/TECNICA";
  if (dest === "CLIENTS") return "PREVENTA/CLIENTS";
  if (dest === "O.C. PROVEEDORES") return "LOGISTICA/O.C. PROVEEDORES";
  return "";
}

function formatExcelValidationError(error: {
  sheet: string;
  row?: number | null;
  column?: string | null;
  message: string;
}) {
  const location = [
    error.sheet,
    error.row != null ? `fila ${error.row}` : null,
    error.column ? `columna ${error.column}` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return location ? `${location}: ${error.message}` : error.message;
}

export function ProjectChangeStateForm({
  defaultValues,
  onSubmit,
  saving,
  onCancel,
  currentStateLabel,
  pendingCount = 0,
  opporNumber 
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (dto: ProjectsUpdateStatusDto, files?: ProjectFileUploaded[]) => void;
  saving?: boolean;
  onCancel?: () => void;
  currentStateLabel?: string;
  pendingCount?: number;
  opporNumber: string; 
}) {
  
  const [pendingFiles, setPendingFiles] = useState<PendingHiringFile[]>([]);
  const [projectFileWarnings, setProjectFileWarnings] = useState<string[]>([]);

  const { data: historyData, isLoading: isLoadingHistory } =
    useProjectObservationList(0, 0, "", defaultValues?.linkToken ?? "");
  const historyItems = historyData?.items ?? [];

  const { data: allObservationsData } = useProjectObservationProjectList(0, 0, "", defaultValues?.linkToken ?? "");

  const initialSeverity = useMemo(() => {
    if (isLoadingHistory) return SEVERITY_NORMAL;
    if (historyItems.length === 0) return SEVERITY_NORMAL;
    const hasUrgent = historyItems.some((i: any) => i.obsSeverity === SEVERITY_URGENT);
    return hasUrgent ? SEVERITY_URGENT : SEVERITY_NORMAL;
  }, [historyItems, isLoadingHistory]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,      
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      assignedWorkerId: [], 
      obsReason: [],        
      obsSeverity: initialSeverity,
    },
  });

  const currentStateId = useWatch({ control, name: "statePreSaleId" });
  const currentReasons = useWatch({ control, name: "obsReason" });
  const currentSeverity = useWatch({ control, name: "obsSeverity" });

  const showObservationPanel = currentStateId === ID_DESARROLLO || currentStateId === ID_OBSERVADO;
  const showTeamPanel = currentStateId === ID_DESARROLLO || currentStateId === ID_OBSERVADO;
  
  const showFilesPanel = currentStateId === ID_ENTREGADO;

  const isTeamEnabled = currentStateId === ID_DESARROLLO && currentSeverity === SEVERITY_NORMAL;
  
  let blockReasonMessage = "Acción no disponible.";
  if (currentStateId === ID_OBSERVADO) {
      blockReasonMessage = "La asignación de equipo está inhabilitada en estado 'Observado'.";
  } else if (currentSeverity === SEVERITY_URGENT) {
      blockReasonMessage = "No se puede asignar equipo si la observación es Urgente.";
  } else {
      blockReasonMessage = "Seleccione prioridad 'Normal' para habilitar la asignación.";
  }

  useEffect(() => {
    if (!isTeamEnabled && currentSeverity !== undefined) {
      setValue("assignedWorkerId", []); 
    }
  }, [isTeamEnabled, setValue, currentSeverity]);

  useEffect(() => {
    if (currentSeverity === SEVERITY_NORMAL) setValue("obsReason", []); 
  }, [currentSeverity, setValue]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        obsSeverity: initialSeverity,
        assignedWorkerId: defaultValues.assignedWorkerId ?? [],
        obsReason: defaultValues.obsReason ?? [],
      });
    }
  }, [defaultValues, reset, initialSeverity]);

  useEffect(() => {
     if(pendingFiles.length > 0) {
       clearErrors("projectFiles");
     }
     setProjectFileWarnings([]);
  }, [pendingFiles, clearErrors]);

  const { data: statesResp } = useStatePreSaleOptions();
  const stateOptions = useMemo(() => statesResp?.items ?? [], [statesResp]);

  const handleFormSubmit = async (data: FormValues) => {
    if (data.statePreSaleId === ID_ENTREGADO) {
        const errorMessages: string[] = [];
        const contractList = allObservationsData?.items ?? []; 

        if (pendingCount > 0) errorMessages.push(`Existen ${pendingCount} entregables pendientes.`);

        const incompleteContracts = contractList.filter((obs: any) => 
            obs.obsType === OBS_TYPE_CONTRACT && obs.obsStatusId !== OBS_STATUS_COMPLETED
        );
        if (incompleteContracts.length > 0) errorMessages.push(`Existen ${incompleteContracts.length} contratos pendientes de validación/firma.`);

        const unresolvedGeneral = historyItems.filter((obs: any) => 
            obs.obsType === OBS_TYPE_GENERAL && 
            obs.typeObsEconomic == null && 
            (obs.obsStatusId !== OBS_STATUS_COMPLETED || obs.isApproved == null)
        );

        if (unresolvedGeneral.length > 0) {
             errorMessages.push(`Existen ${unresolvedGeneral.length} observaciones comerciales sin resolución final.`);
        }

        if (errorMessages.length > 0) {
            setError("statePreSaleId", {
                type: "custom",
                message: `No se puede finalizar:\n\n• ${errorMessages.join("\n• ")}`
            });
            return;
        }

        // --- VALIDACIÓN DE ARCHIVOS COMENTADA ---
        /*
        if (pendingFiles.length === 0) {
            setError("projectFiles", {
              type: "custom",
              message: "Debes subir al menos un archivo para cambiar al estado Entregado."
            });
            return;
        }

        const hasMissingDest = pendingFiles.some(f => !f.destination);
        if (hasMissingDest) {
            setError("projectFiles", {
              type: "custom",
              message: "Debes seleccionar una carpeta de destino para todos los archivos."
            });
            return;
        }
        */
        // -----------------------------------------
    }
    
    // Ejecuta directo sin modal intermedio
    await executeSubmission(data);
  };

  const executeSubmission = async (data: FormValues) => {
    let uploadedFiles: ProjectFileUploaded[] | undefined = undefined;

    if (data.statePreSaleId === ID_ENTREGADO) {
        try {
          setProjectFileWarnings([]);
          const year = String(new Date().getFullYear());
          const rootFolderName = "OPORTUNIDADES";
          const baseSegments = [year, rootFolderName];

          for (const pItem of pendingFiles) {
            const dest = pItem.destination!;
            const folderKey = getPreSaleFolderKey(dest);

            if (!QUOTATION_VALIDATION_FOLDER_KEYS.has(folderKey)) continue;

            const validation = await validateQuotationExcel(pItem.file);

            if (!validation.isValid) {
              const messages = validation.errors.length
                ? validation.errors.map(formatExcelValidationError)
                : ["El Excel no cumple con el formato requerido."];

              setProjectFileWarnings([]);
              setError("projectFiles", {
                type: "custom",
                message: `Corrige el archivo "${pItem.file.name}":\n\n• ${messages.join("\n• ")}`
              });
              return;
            }

            if (validation.warnings.length > 0) {
              setProjectFileWarnings((prev) => [
                ...prev,
                ...validation.warnings.map((warning) => `${pItem.file.name}: ${warning}`),
              ]);
            }
          }

          uploadedFiles = await Promise.all(
            pendingFiles.map(async (pItem) => {
               const dest = pItem.destination!;
               const folderKey = getPreSaleFolderKey(dest);

               const normalizedFile = new File([pItem.file], pItem.file.name.normalize("NFC"), {
                type: pItem.file.type,
                lastModified: pItem.file.lastModified,
              });

              const up = await uploadByArchiveType(
                normalizedFile,
                opporNumber, 
                folderKey,
                { strategy: "same", baseSegments }
              );

               return {
                 fileTitle: up.fileName,
                 fileUrl: up.url,
                 relativePath: up.relativePath,
                 archiveType: dest 
               };
            })
          );

        } catch (err) {
           console.error("Error subiendo archivos", err);
           setError("projectFiles", {
             type: "custom",
             message: "Ocurrió un error al subir los archivos. Intente nuevamente."
           });
           return;
        }
    }
    
    const finalSeverity = data.obsSeverity ?? SEVERITY_NORMAL;

    onSubmit({
      linkToken: data.linkToken,
      businessId: data.businessId ?? 0,
      statePreSaleId: data.statePreSaleId,
      obsType: showObservationPanel ? 1 : undefined,
      obsStatusId: showObservationPanel ? 1 : undefined,
      obsSeverity: showObservationPanel ? finalSeverity : undefined,
      obsReason: showObservationPanel ? data.obsReason : undefined, 
      assignedWorkerId: showTeamPanel && isTeamEnabled ? data.assignedWorkerId : undefined,
    }, uploadedFiles);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 relative">
      
      <RHFSearchSelect
        name="statePreSaleId"
        control={control}
        label="Nuevo Estado"
        options={stateOptions}
        placeholder="Seleccione el nuevo estado..."
        fallbackLabel={currentStateLabel}
        onChangeCallback={() => {
            clearErrors("statePreSaleId");
            setPendingFiles([]);
            clearErrors("projectFiles"); 
        }}
      />

      {showFilesPanel && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-gray-200 bg-gray-50 p-4">
           <label className="mb-3 block text-sm font-semibold text-gray-700">
             Adjuntar Entregables
           </label>
           
           <OpporHiringFilesSection
             files={pendingFiles}
             onChange={setPendingFiles}
             disabled={saving}
             showDestinationSelect={true}
             destinationOptions={PRE_SALE_FILE_OPTIONS} 
             error={errors.projectFiles as any}
           />

           {projectFileWarnings.length > 0 && (
             <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
               <div className="font-semibold">
                 Advertencias encontradas en el Excel:
               </div>
               <ul className="mt-1 list-disc space-y-1 pl-4">
                 {projectFileWarnings.map((message, idx) => (
                   <li key={`${message}-${idx}`}>{message}</li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      )}

      {(showObservationPanel || showTeamPanel) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {showObservationPanel && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                 <ProjectObservationStager 
                   key={defaultValues?.linkToken || "obs-stager"}
                   isVisible={true}
                   value={currentReasons || []}
                   setValue={setValue}
                   control={control}
                   error={errors.obsReason?.message}
                   disabled={saving || isLoadingHistory} 
                   projectToken={defaultValues?.linkToken}
                 />
              </div>
            )}

            {showTeamPanel && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <ProjectTeamManager 
                  isVisible={true}
                  setValue={setValue}
                  projectToken={defaultValues?.linkToken}
                  businessId={defaultValues?.businessId}
                  saving={saving}
                  disabled={!isTeamEnabled} 
                  blockMessage={blockReasonMessage}
                />
              </div>
            )}
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
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
