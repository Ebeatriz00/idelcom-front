import { useState } from "react";
import { Modal } from "@/layouts";
import { validateQuotationExcel } from "@/infrastructure";
import { 
  OpporHiringFilesSection, 
  type FileDestinationOption, 
  type PendingHiringFile 
} from "@/pages/crm/opportunity/components/modal/deliverablesHiring/opporHiringFilesSection";
import { 
  uploadByArchiveType, 
  showApiError, 
  useFTOpportunitiesMutations, 
  showSuccess
} from "@/sharedKernel";
import { Paperclip } from "lucide-react";

const TASK_FILE_OPTIONS: FileDestinationOption[] = [
  { label: "Cotización", value: "COTIZACION" },
];

const QUOTATION_VALIDATION_FOLDER_KEYS = new Set([
  "PRESUPUESTAL/CLIENTES",
  "PREVENTA/TECNICA",
]);

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

interface Props {
  open: boolean;
  onClose: () => void;
  task: any;
  opporNumber: string;
  projectData?: any;
  onSuccess?: () => void;
}

export function TaskFilesModal({ open, onClose, task, opporNumber, projectData, onSuccess }: Props) {
  if (!open) return null;

  const [pendingFiles, setPendingFiles] = useState<PendingHiringFile[]>([]);
  const [busy, setBusy] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelWarnings, setExcelWarnings] = useState<string[]>([]);
  
  const { createFTMut } = useFTOpportunitiesMutations();

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    const hasMissingDest = pendingFiles.some(f => !f.destination);
    if (hasMissingDest) {
      return;
    }

    setBusy(true);
    setExcelErrors([]);
    setExcelWarnings([]);

    try {
      const year = String(new Date().getFullYear());
      const baseSegments = [year, "OPORTUNIDADES"];
      const totalFiles = pendingFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const pItem = pendingFiles[i];
        const dest = pItem.destination!;
        let folderKey = dest === "COTIZACION" ? "PREVENTA/COTIZACION" : "PREVENTA/TECNICA";

        if (QUOTATION_VALIDATION_FOLDER_KEYS.has(folderKey)) {
          const validation = await validateQuotationExcel(pItem.file);

          if (!validation.isValid) {
            const messages = validation.errors.length
              ? validation.errors.map(formatExcelValidationError)
              : ["El Excel no cumple con el formato requerido."];

            setExcelErrors(messages.map((message) => `${pItem.file.name}: ${message}`));
            setExcelWarnings([]);
            return;
          }

          if (validation.warnings.length > 0) {
            setExcelWarnings((prev) => [
              ...prev,
              ...validation.warnings.map((warning) => `${pItem.file.name}: ${warning}`),
            ]);
          }
        }

        setUploadLabel(`Subiendo ${i + 1} de ${totalFiles}: ${pItem.file.name}`);
        setUploadProgress(0);

        const normalizedFile = new File([pItem.file], pItem.file.name.normalize("NFC"), {
          type: pItem.file.type,
          lastModified: pItem.file.lastModified,
        });

        const up = await uploadByArchiveType(
          normalizedFile,
          opporNumber,
          folderKey,
          { 
            strategy: "same", 
            baseSegments,
            onProgress: (percent) => {
              setUploadProgress(percent); 
            }
          }
        );

        const payload = {
          opporToken: projectData?.linkToken, 
          fileTitle: up.fileName,
          fileUrl: up.url,
          relativePath: up.relativePath,
          comment: `Entregable de la tarea: ${task?.titleTasks || ""}`,
          archiveType: dest,
          projectToken: projectData?.linkToken, 
          tasksId: task?.tasksId || task?.tasksToken,
          
          silent: true 
        };

        await createFTMut.mutateAsync(payload as any);
      }

      setPendingFiles([]);
      
      await showSuccess("Éxito", "Todos los archivos se guardaron correctamente.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showApiError(err, "Error al procesar los archivos.");
    } finally {
      setBusy(false);
      setUploadProgress(null);
      setUploadLabel(null);
    }
  };

  return (
    <Modal
      title={`Adjuntar Entregables - ${task?.titleTasks}`}
      size="md"
      onClose={onClose}
    >
      <div className="p-4 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Paperclip size={16} />
            Archivos para la tarea
          </label>
          
          <OpporHiringFilesSection
            files={pendingFiles}
            onChange={(files) => {
              setPendingFiles(files);
              setExcelErrors([]);
              setExcelWarnings([]);
            }}
            disabled={busy}
            showDestinationSelect={true}
            destinationOptions={TASK_FILE_OPTIONS}
          />

          {excelErrors.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <div className="font-semibold">
                Errores encontrados en el Excel:
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {excelErrors.map((message, idx) => (
                  <li key={`${message}-${idx}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {excelWarnings.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <div className="font-semibold">
                Advertencias encontradas en el Excel:
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {excelWarnings.map((message, idx) => (
                  <li key={`${message}-${idx}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- BARRA DE PROGRESO INTEGRADA --- */}
        {uploadProgress !== null && (
          <div className="space-y-1.5 p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
            {uploadLabel && (
              <p className="text-xs font-medium text-gray-600 truncate">{uploadLabel}</p>
            )}
            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 text-right font-medium">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={busy || pendingFiles.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors shadow-sm"
          >
            {busy ? "Guardando..." : "Guardar Archivos"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
