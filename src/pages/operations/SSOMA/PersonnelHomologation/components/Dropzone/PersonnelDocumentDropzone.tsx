import {
  localFileUrl,
} from "@/sharedKernel";
import { Eye, FileText, UploadCloud, X, RefreshCw, CheckCircle2, AlertCircle, Info, Calendar, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/layouts/presentation/ProgressBar";
import type { PropsDocumentDropzone } from "../../utils/TypesPersonnel";
import { formatMb } from "../../utils/helper";

function buildRequirementFileBaseName(requirementName: string) {
  return (
    requirementName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "REQUISITO"
  );
}

export function PersonnelDocumentDropzone({
  requirement,
  requirementName,
  issueDate,
  expirationDate,
  workerName,
  operationLabel,
  homologationScopeId,
  value,
  disabled,
  onUploaded,
  onRemove,
  onUseInternal,
}: PropsDocumentDropzone) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentObjectUrlRef = useRef("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    if (!requirementName) {
      setError("");
      return;
    }
    if (!requirement?.requiresExpiration || expirationDate?.trim()) {
      setError("");
    }
  }, [error, expirationDate, requirement?.requiresExpiration, requirementName]);

  const accept = requirement?.allowedExtensions
    ? requirement.allowedExtensions
        .split(",")
        .map((ext) => `.${ext.trim().replace(".", "")}`)
        .join(",")
    : ".pdf,.doc,.docx,.jpg,.jpeg,.png";

  const handleUpload = async (file: File) => {
    if (disabled) return;
    if (!requirementName) {
      setError("Selecciona un requisito primero");
      return;
    }
    if (requirement?.requiresExpiration && !expirationDate?.trim()) {
      setError("Ingresa la fecha de vencimiento primero");
      return;
    }

    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const allowedExts = (accept || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

    if (accept && accept !== "*" && !allowedExts.includes(fileExt)) {
      setError(`Extensión "${fileExt}" no permitida.`);
      return;
    }

    if (requirement?.maxFileSize && file.size > requirement.maxFileSize * 1024) {
      setError(`Supera el máximo de ${formatMb(requirement.maxFileSize)}`);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError("");

    try {
      const year = new Date().getFullYear().toString();
      const cleanWorkerName = (workerName || "SIN_NOMBRE").trim().toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim();
      const segments = [year, "OPERACIONES", "SSOMA", "HOMOLOGACIONES", cleanWorkerName];

      if (Number(homologationScopeId) === 1) segments.push("INTERNO");
      else if (Number(homologationScopeId) === 2) {
        const cleanOpName = (operationLabel || "SIN_OPERACION").trim().toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim();
        segments.push("EXTERNO", cleanOpName);
      }

      const cleanReqName = buildRequirementFileBaseName(requirementName);
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const newFileName = `${cleanReqName}.${extension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      // Simular progreso rpido para mantener la UX
      setProgress(100);

      const tempPath = segments.join("/") + "/" + newFileName;

      onUploaded({
        fileName: newFileName,
        fileUrl: URL.createObjectURL(renamedFile),
        filePath: tempPath,
        rawFile: renamedFile,
      });
    } catch (err: any) {
      setError(err.message || "Error al subir");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;
    void handleUpload(files[0]);
  };

  const showInternalReuse = requirement?.allowInternalReuse === 1 && !!requirement?.internalFileName && !value?.fileName;

  return (
    <div className="space-y-4">
      {/* Información del Requisito */}
      {requirement && (
        <div className="flex flex-wrap gap-2">
           <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm">
              <Info className="size-3 text-blue-500" />
              <span>MAX: {formatMb(requirement.maxFileSize)}</span>
           </div>
           <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm">
              <FileText className="size-3 text-slate-400" />
              <span>{requirement.allowedExtensions || ".PDF, .JPG"}</span>
           </div>
           {requirement.isSatisfied && !requirement.needsUpload && (
             <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3" /> Cubierto
             </div>
           )}
        </div>
      )}

      {/* Reutilización Interna */}
      {showInternalReuse && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm ring-1 ring-emerald-100">
          <div className="flex items-start gap-3">
             <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                <RefreshCw className="size-4" />
             </div>
             <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-800">Sugerencia del sistema</p>
                <p className="mt-0.5 truncate text-[11px] text-emerald-600">Reutilizar: {requirement?.internalFileName}</p>
                <div className="mt-3 flex gap-2">
                   <button
                     type="button"
                     onClick={onUseInternal}
                     className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700"
                   >
                     Usar ahora
                   </button>
                   {requirement?.internalFileUrl && (
                     <a
                       href={requirement.internalFileUrl}
                       target="_blank"
                       rel="noreferrer"
                       className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                     >
                       Vista previa
                     </a>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Área de Carga / Archivo Subido */}
      {value?.fileName ? (
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-4 shadow-sm ring-1 ring-blue-100 transition-all hover:shadow-md">
           <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                 <FileText className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                 <p className="truncate text-sm font-bold text-slate-800" title={value.fileName}>
                    {value.fileName}
                 </p>
                 <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
                    <span className="flex items-center gap-1.5">
                       <Calendar className="size-3" />
                       Emitido: {issueDate || "N/A"}
                    </span>
                    {expirationDate && (
                      <span className="flex items-center gap-1.5">
                         <Clock className="size-3" />
                         Vence: {expirationDate}
                      </span>
                    )}
                 </div>

                 <div className="mt-4 flex flex-wrap gap-2">
                    {value.fileUrl && (
                      <a
                        href={value.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-bold text-white transition-all hover:bg-slate-800 shadow-sm"
                      >
                        <Eye className="size-3.5" />
                        Ver documento
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={onRemove}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <X className="size-3.5" />
                      Quitar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className={[
              "flex min-h-[160px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300",
              isDragging
                ? "border-blue-400 bg-blue-50/50 shadow-inner"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 shadow-sm",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50",
            ].join(" ")}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 px-6">
                <ProgressBar value={progress} widthClass="w-48 md:w-64" colorKey="primary" heightClass="h-2" />
                <p className="text-xs font-bold text-slate-500 animate-pulse">
                  Subiendo archivo... {progress}%
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors shadow-sm">
                   <UploadCloud className="size-7" />
                </div>
                <p className="px-6 text-sm font-bold text-slate-700">
                  Arrastra tu archivo aquí
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  o haz click para explorar tus archivos localmente
                </p>
              </>
            )}
          </button>

          {(disabled || (requirement?.requiresExpiration && !expirationDate)) && !isUploading && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 ring-1 ring-inset ring-amber-200">
               <AlertCircle className="size-4 text-amber-600 shrink-0" />
               <p className="text-[11px] font-bold text-amber-700 leading-tight">
                  {!requirementName 
                    ? "Selecciona un requisito para habilitar la carga" 
                    : "Debes ingresar la fecha de vencimiento antes de subir el archivo"}
               </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-rose-600 animate-in fade-in slide-in-from-left-2">
           <AlertCircle className="size-3.5" />
           <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
