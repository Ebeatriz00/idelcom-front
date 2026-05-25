import type { SsomaHomologationPersonnelDocumentReplaceDto } from "@/application";
import { Modal, ProgressBar, useModalHistoryLock } from "@/layouts";
import {
  ensureFolderLocalPath,
  listLocalFiles,
  localFileUrl,
  showApiError,
  showLoading,
  uploadToLocalDrive,
  useByPersonnelHomologationList,
  useReplaceSsomaHomologationPersonnelDocument,
} from "@/sharedKernel";
import { useRequirementSpecifications } from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Shield,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateExpirationDate,
  formatMb,
  resolveRequirementDuration,
} from "../../utils/helper";
import type { PersonnelHomologationRequirementItem } from "../../utils/TypesPersonnel";
import { CurrentDocumentSummary } from "./CurrentDocumentSummary";
import { ReplaceDocumentHeader } from "./ReplaceDocumentHeader";

type ReplacementDraft = SsomaHomologationPersonnelDocumentReplaceDto & {
  key: string;
  requirementName: string;
  operationName?: string;
  originalItem: PersonnelHomologationRequirementItem;
};

type ReplacementDraftValue = ReplacementDraft[keyof ReplacementDraft];

type ReplacementRequirementConfig = {
  allowedExtensions?: string;
  maxFileSize?: number;
  duration?: number;
  requerimentDuration?: number;
  requiresExpiration?: boolean;
};

type ReplacementOriginalItem = PersonnelHomologationRequirementItem &
  ReplacementRequirementConfig & {
    operationsName?: string;
    OperationsName?: string;
    operationsId?: number;
    OperationsId?: number;
    operationsRequirementId?: number;
    workerId?: number;
    expirationDate?: string;
  };

type Props = {
  open: boolean;
  items: PersonnelHomologationRequirementItem[];
  workerName?: string;
  workerId?: number;
  homologationScopeId?: number;
  onClose: () => void;
};

function toValidNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanSegment(value?: string) {
  return (
    (value || "SIN_NOMBRE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim() || "SIN_NOMBRE"
  );
}

function cleanFileBaseName(value?: string) {
  return (
    cleanSegment(value)
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "REQUISITO"
  );
}

function buildDatePart(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function buildTimePart(date: Date) {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join("");
}

async function resolveReplacementFileName(
  segments: string[],
  requirementName?: string,
  extension?: string,
) {
  const now = new Date();
  const cleanRequirementName = cleanFileBaseName(requirementName);
  const datePart = buildDatePart(now);
  const ext = extension ? `.${extension}` : "";
  const baseName = `${cleanRequirementName}_REM_${datePart}`;
  const defaultName = `${baseName}${ext}`;

  const ensured = await ensureFolderLocalPath(segments);
  const list = await listLocalFiles(ensured.relativePath);
  const alreadyExists = (list.items ?? []).some(
    (item) => item.name?.trim().toUpperCase() === defaultName.toUpperCase(),
  );

  if (!alreadyExists) return defaultName;

  return `${baseName}_${buildTimePart(now)}${ext}`;
}

function itemKey(item: PersonnelHomologationRequirementItem, index: number) {
  return String(
    item.ssomaHomologationPersonnelDocumentId ??
      `${item.homologationPersonnelId ?? "h"}-${item.requirementId ?? "r"}-${index}`,
  );
}

function buildAcceptValue(allowedExtensions?: string) {
  const extensions = String(allowedExtensions || "")
    .split(",")
    .map((ext) => ext.trim().replace(".", "").toLowerCase())
    .filter(Boolean);

  if (!extensions.length) return ".pdf,.doc,.docx,.jpg,.jpeg,.png";
  return extensions.map((ext) => `.${ext}`).join(",");
}

function validateReplacementFile(
  file: File,
  config?: { allowedExtensions?: string; maxFileSize?: number } | null,
) {
  const allowedExtensions = String(config?.allowedExtensions || "")
    .split(",")
    .map((ext) => ext.trim().replace(".", "").toLowerCase())
    .filter(Boolean);

  const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
    return `Formato no permitido. Solo: ${allowedExtensions.join(", ")}`;
  }

  const maxFileSize = Number(config?.maxFileSize || 0);
  const maxBytes = maxFileSize * 1024;

  if (maxBytes > 0 && file.size > maxBytes) {
    return `El archivo supera ${formatMb(maxFileSize)}`;
  }

  return "";
}

function mapItemToDraft(
  item: PersonnelHomologationRequirementItem,
  index: number,
): ReplacementDraft {
  const operationName =
    "operationsName" in item ? item.operationsName : undefined;

  return {
    key: itemKey(item, index),
    ssomaHomologationPersonnelDocumentId:
      item.ssomaHomologationPersonnelDocumentId,
    homologationPersonnelId: toValidNumber(item.homologationPersonnelId),
    requirementId: toValidNumber(item.requirementId),
    requirementName: item.requeriment,
    operationName,
    fileName: "",
    fileUrl: "",
    filePath: "",
    issueDate: item.issueDate ?? "",
    expirationDate: "",
    validationStatusId: toValidNumber(item.validationStatusId, 1),
    reviewDate: item.fileReview ?? "",
    observation: item.observation ?? "",
    replacementReason: "",
    originalItem: item,
  };
}

// --- SUB-COMPONENTE PARA CADA REEMPLAZO ---
type ReplacementDraftItemProps = {
  draft: ReplacementDraft;
  isUploading: boolean;
  progress: number;
  onUpdate: (
    key: string,
    field: keyof ReplacementDraft,
    value: ReplacementDraftValue,
  ) => void;
  onUpload: (draft: ReplacementDraft, file?: File) => void;
  workerId?: number;
};

function ReplacementDraftItem({
  draft,
  isUploading,
  progress,
  onUpdate,
  onUpload,
  workerId,
}: ReplacementDraftItemProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState("");

  // 1. Identificar si es un requerimiento de operación y capturar IDs
  const original = draft.originalItem as ReplacementOriginalItem;
  const isOperationReq = Boolean(
    draft.operationName ||
    original?.operationsName ||
    original?.OperationsName ||
    original?.operationsId ||
    original?.OperationsId ||
    original?.operationsRequirementId,
  );
  const effectiveWorkerId = Number(original?.workerId || workerId || 0);

  // Buscar el OperationsId en todas las variantes posibles
  const opId = Number(original?.operationsId || original?.OperationsId || 0);

  // 2. CONSULTAS A API (Condicionales)
  const { data: generalDetails, isFetching: loadingGeneralDetails } =
    useRequirementSpecifications(Number(draft.requirementId), {
      enabled: !isOperationReq && Boolean(draft.requirementId),
    });

  const { data: operationList, isFetching: loadingOpList } =
    useByPersonnelHomologationList(1, 100, "", opId, effectiveWorkerId, {
      enabled: isOperationReq && opId > 0,
    });

  // 3. MATCHING Y EXTRACCIÓN DE DURACIÓN
  const duration = useMemo(() => {
    // Caso A: Requerimiento de Operación
    if (isOperationReq && operationList?.items) {
      const targetId = Number(draft.requirementId);
      const found = operationList.items.find(
        (x) =>
          Number(x.requirementId) === targetId ||
          Number(x.operationsRequirementId) === targetId ||
          x.requirementName === draft.requirementName,
      );
      if (found?.duration) return Number(found.duration);
    }

    // Caso B: Requerimiento General
    if (generalDetails?.duration) return Number(generalDetails.duration);

    // Caso C: Fallback al item original
    const fallback = original?.duration || original?.requerimentDuration;
    return fallback ? Number(fallback) : 0;
  }, [
    isOperationReq,
    operationList,
    generalDetails,
    original,
    draft.requirementId,
    draft.requirementName,
  ]);

  // 4. LÓGICA DE AUTOCALCULADO
  const resolvedRequirementConfig = useMemo(() => {
    if (isOperationReq && operationList?.items) {
      const targetRequirementId = Number(draft.requirementId);
      const targetOperationsRequirementId = Number(
        original?.operationsRequirementId ?? draft.requirementId,
      );
      const normalizedDraftName = String(draft.requirementName || "")
        .trim()
        .toUpperCase();

      const matchedConfig =
        operationList.items.find((x) => {
          const matchesRequirementId =
            Number(x.requirementId) === targetRequirementId;
          const matchesOperationsRequirementId =
            Number(x.operationsRequirementId) === targetOperationsRequirementId;
          const matchesName =
            String(x.requirementName || "")
              .trim()
              .toUpperCase() === normalizedDraftName;

          return (
            matchesOperationsRequirementId ||
            matchesRequirementId ||
            matchesName
          );
        }) ?? null;

      return matchedConfig;
    }

    return generalDetails ?? null;
  }, [
    isOperationReq,
    operationList,
    generalDetails,
    original?.operationsRequirementId,
    draft.requirementId,
    draft.requirementName,
  ]);

  const config = resolvedRequirementConfig as ReplacementRequirementConfig | null;

  const resolvedDuration = useMemo(() => {
    return resolveRequirementDuration(
      config?.duration || config?.requerimentDuration,
      duration,
      String(original?.issueDate || ""),
      String(original?.fileExpiration || original?.expirationDate || ""),
    );
  }, [config, duration, original]);

  const allowedExtensions = String(
    config?.allowedExtensions || original?.allowedExtensions || "",
  );
  const maxFileSize = Number(
    config?.maxFileSize || original?.maxFileSize || 0,
  );
  const accept = buildAcceptValue(allowedExtensions);
  const isLoadingRequirementConfig =
    (isOperationReq && loadingOpList) || (!isOperationReq && loadingGeneralDetails);

  const handleSelectedFile = (file?: File) => {
    if (!file || isUploading) return;
    if (isLoadingRequirementConfig) {
      setUploadError("Espera a que se carguen las especificaciones del requisito.");
      return;
    }

    const validationMessage = validateReplacementFile(file, {
      allowedExtensions,
      maxFileSize,
    });

    if (validationMessage) {
      setUploadError(validationMessage);
      return;
    }

    setUploadError("");
    void onUpload(draft, file);
  };

  const requiresExpiration = config?.requiresExpiration !== false;

  const expirationMode = requiresExpiration ? "required" : "disabled";

  useEffect(() => {
    if (
      expirationMode === "required" &&
      resolvedDuration > 0 &&
      draft.issueDate
    ) {
      try {
        const nextExpiration = calculateExpirationDate(
          draft.issueDate,
          resolvedDuration,
        );
        if (nextExpiration && nextExpiration !== draft.expirationDate) {
          onUpdate(draft.key, "expirationDate", nextExpiration);
        }
      } catch (e) {
        console.error("Error al calcular vigencia en item", e);
      }
    }
    if (expirationMode === "disabled" && draft.expirationDate) {
      onUpdate(draft.key, "expirationDate", "");
    }
  }, [
    draft.issueDate,
    resolvedDuration,
    draft.key,
    onUpdate,
    draft.expirationDate,
    expirationMode,
  ]);

  const hasFile = Boolean(draft.fileName);
  const hasReason = Boolean(draft.replacementReason?.trim());
  const hasIssueDate = Boolean(draft.issueDate?.trim());

  const labelClass =
    "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-2";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
            1
          </span>
          <h3 className="text-sm font-bold text-slate-800">
            Documento a sustituir
          </h3>
        </div>
        <CurrentDocumentSummary
          requirementName={draft.requirementName}
          operationName={draft.operationName}
          currentFileName={draft.originalItem.fileName}
          currentFileUrl={draft.originalItem.fileUrl}
          statusName={draft.originalItem.validationStatus}
          expirationDate={draft.originalItem.fileExpiration}
          reviewDate={draft.originalItem.fileReview}
        />

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 ring-1 ring-slate-200/50">
          <div className="mb-3 flex items-center justify-between">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Estado de validación
            </h5>
            {resolvedDuration > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-200 animate-in fade-in">
                VIGENCIA {resolvedDuration} DÍAS
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              {hasFile ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Clock className="size-4 text-slate-300" />
              )}
              <span className={hasFile ? "text-emerald-700" : "text-slate-500"}>
                Archivo nuevo cargado
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              {hasReason ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Clock className="size-4 text-slate-300" />
              )}
              <span
                className={hasReason ? "text-emerald-700" : "text-slate-500"}
              >
                Motivo de reemplazo especificado
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              {hasIssueDate ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Clock className="size-4 text-slate-300" />
              )}
              <span
                className={hasIssueDate ? "text-emerald-700" : "text-slate-500"}
              >
                Fecha de emisión obligatoria
              </span>
            </div>
          </div>

          {loadingOpList && isOperationReq && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-500 animate-pulse">
              <Shield className="size-3" />
              Consultando especificaciones del proyecto...
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200">
            2
          </span>
          <h3 className="text-sm font-bold text-slate-800">
            Cargar nueva versión
          </h3>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="space-y-6">
            <div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => {
                  handleSelectedFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              <button
                type="button"
                disabled={isUploading || isLoadingRequirementConfig}
                onClick={() => inputRef.current?.click()}
                className={[
                  "relative flex min-h-[140px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300",
                  isUploading || isLoadingRequirementConfig
                    ? "border-blue-400 bg-blue-50/30"
                    : hasFile
                      ? "border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50 shadow-inner"
                      : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 shadow-sm",
                ].join(" ")}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4 px-6">
                    <ProgressBar
                      value={progress}
                      widthClass="w-48"
                      colorKey="primary"
                      heightClass="h-2"
                    />
                    <p className="text-xs font-bold text-slate-500 animate-pulse">
                      Subiendo reemplazo...
                    </p>
                  </div>
                ) : isLoadingRequirementConfig ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                    <p className="text-xs font-bold text-slate-500">
                      Cargando especificaciones...
                    </p>
                  </div>
                ) : hasFile ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 shadow-sm ring-1 ring-emerald-200">
                      <FileText className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-bold text-emerald-800 max-w-[240px]"
                        title={draft.fileName}
                      >
                        {draft.fileName}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-emerald-600 uppercase">
                        ¡Archivo listo!
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      Click para cambiar
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-2xl bg-slate-50 p-3 text-slate-400 shadow-sm ring-1 ring-slate-200">
                      <UploadCloud className="size-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      Seleccionar archivo
                    </p>
                  </div>
                )}
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                  <FileText className="size-3 text-slate-400" />
                  {allowedExtensions || "pdf, doc, docx, jpg, jpeg, png"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                  <Shield className="size-3 text-blue-500" />
                  MAX: {formatMb(maxFileSize)}
                </span>
              </div>
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 px-1 text-[11px] font-bold text-rose-600">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  <Calendar className="size-3.5" /> Emisión *
                </label>
                <input
                  type="date"
                  value={draft.issueDate ?? ""}
                  onChange={(e) => {
                    const nextIssueDate = e.target.value;
                    onUpdate(draft.key, "issueDate", nextIssueDate);

                    if (expirationMode === "disabled") {
                      onUpdate(draft.key, "expirationDate", "");
                      return;
                    }

                    const nextExpirationDate = calculateExpirationDate(
                      nextIssueDate,
                      resolvedDuration,
                    );

                    if (nextExpirationDate) {
                      onUpdate(draft.key, "expirationDate", nextExpirationDate);
                    }
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar className="size-3.5" /> Vencimiento
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={draft.expirationDate ?? ""}
                    onChange={(e) =>
                      onUpdate(draft.key, "expirationDate", e.target.value)
                    }
                    className={[
                      inputClass,
                      resolvedDuration > 0
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "",
                    ].join(" ")}
                  />
                  {resolvedDuration > 0 && (
                    <div className="pointer-events-none absolute -top-2 right-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black text-white uppercase tracking-tighter shadow-sm">
                      AUTO (+{resolvedDuration}d)
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  <Clock className="size-3.5" /> Fecha de revisión
                </label>
                <input
                  type="date"
                  value={draft.reviewDate ?? ""}
                  onChange={(e) =>
                    onUpdate(draft.key, "reviewDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <MessageSquare className="size-3.5" /> Motivo del reemplazo *
              </label>
              <textarea
                value={draft.replacementReason ?? ""}
                onChange={(e) =>
                  onUpdate(draft.key, "replacementReason", e.target.value)
                }
                rows={3}
                placeholder="Detalla el motivo del cambio..."
                className={[inputClass, "resize-none"].join(" ")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL DEL MODAL ---
export function PersonnelHomologationReplaceDocumentsModal({
  open,
  items,
  workerName,
  workerId,
  homologationScopeId,
  onClose,
}: Props) {
  useModalHistoryLock(open, onClose);

  const [drafts, setDrafts] = useState<ReplacementDraft[]>([]);
  const [uploadingKey, setUploadingKey] = useState("");
  const [progressByKey, setProgressByKey] = useState<Record<string, number>>(
    {},
  );
  const replaceMutation = useReplaceSsomaHomologationPersonnelDocument();

  useEffect(() => {
    if (!open) return;
    setDrafts(items.map(mapItemToDraft));
    setUploadingKey("");
    setProgressByKey({});
  }, [items, open]);

  const updateDraftValue = useCallback(
    (key: string, field: keyof ReplacementDraft, value: ReplacementDraftValue) => {
      setDrafts((current) =>
        current.map((draft) =>
          draft.key === key ? { ...draft, [field]: value } : draft,
        ),
      );
    },
    [],
  );

  const handleUpload = async (draft: ReplacementDraft, file?: File) => {
    if (!file) return;

    setUploadingKey(draft.key);
    setProgressByKey((current) => ({ ...current, [draft.key]: 0 }));

    try {
      const year = new Date().getFullYear().toString();
      const segments = [
        year,
        "OPERACIONES",
        "SSOMA",
        "HOMOLOGACIONES",
        cleanSegment(workerName),
      ];

      if (Number(homologationScopeId) === 1) segments.push("INTERNO");
      else {
        segments.push("PROYECTO");
        segments.push(cleanSegment(draft.operationName));
      }

      const extension = file.name.split(".").pop() || "";
      const newFileName = await resolveReplacementFileName(
        segments,
        draft.requirementName,
        extension,
      );
      const renamedFile = new File([file], newFileName, { type: file.type });

      const res = await uploadToLocalDrive(
        renamedFile,
        { segments },
        {
          strategy: "timestamp",
          name: newFileName,
          onProgress: (percent) =>
            setProgressByKey((current) => ({
              ...current,
              [draft.key]: percent,
            })),
        },
      );

      updateDraftValue(draft.key, "fileName", res.fileName || newFileName);
      updateDraftValue(draft.key, "filePath", res.relativePath);
      updateDraftValue(draft.key, "fileUrl", localFileUrl(res.relativePath));
    } catch (err) {
      await showApiError(err, "No se pudo subir el archivo.");
    } finally {
      setUploadingKey("");
    }
  };

  const isFormValid = (draft: ReplacementDraft) => {
    return (
      Boolean(draft.fileName?.trim()) &&
      Boolean(draft.replacementReason?.trim()) &&
      Boolean(draft.issueDate?.trim())
    );
  };

  const canSubmit = drafts.length > 0 && drafts.every(isFormValid);

  const handleSubmit = async () => {
    try {
      showLoading("Reemplazando documentos...");
      await replaceMutation.mutateAsync(
        drafts.length === 1
          ? {
              ssomaHomologationPersonnelDocumentId:
                drafts[0].ssomaHomologationPersonnelDocumentId,
              homologationPersonnelId: drafts[0].homologationPersonnelId,
              requirementId: drafts[0].requirementId,
              fileName: drafts[0].fileName,
              fileUrl: drafts[0].fileUrl,
              filePath: drafts[0].filePath,
              issueDate: drafts[0].issueDate,
              expirationDate: drafts[0].expirationDate,
              validationStatusId: drafts[0].validationStatusId,
              reviewDate: drafts[0].reviewDate,
              observation: drafts[0].observation,
              replacementReason: drafts[0].replacementReason,
            }
          : {
              ...drafts[0],
              documents: drafts,
            },
      );
      onClose();
    } catch (err) {
      await showApiError(err, "No se pudo reemplazar.");
    }
  };

  if (!open) return null;

  return (
    <Modal
      size="full"
      onClose={replaceMutation.isPending ? undefined : onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !canSubmit || Boolean(uploadingKey) || replaceMutation.isPending
            }
            className={[
              "inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold text-white shadow-sm transition-all",
              !canSubmit || Boolean(uploadingKey) || replaceMutation.isPending
                ? "bg-slate-200 cursor-not-allowed text-slate-400"
                : "bg-amber-600 hover:bg-amber-700 active:scale-95",
            ].join(" ")}
          >
            {replaceMutation.isPending ? (
              "Reemplazando..."
            ) : (
              <>
                <ArrowRight className="size-4" /> Confirmar reemplazo
              </>
            )}
          </button>
        </>
      }
    >
      <div className="sticky top-[-1px] z-20 -mx-5 -mt-2 border-b border-slate-200 bg-white px-5 py-4">
        <ReplaceDocumentHeader
          workerName={workerName}
          itemsCount={items.length}
        />
      </div>

      <div className="space-y-10 py-6">
        {drafts.map((draft) => (
          <div key={draft.key}>
            <ReplacementDraftItem
              draft={draft}
              isUploading={uploadingKey === draft.key}
              progress={progressByKey[draft.key] ?? 0}
              onUpdate={updateDraftValue}
              onUpload={handleUpload}
              workerId={workerId}
            />
            {drafts.length > 1 && (
              <div className="mt-10 h-px w-full bg-slate-100" />
            )}
          </div>
        ))}

        {!canSubmit && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 ring-1 ring-amber-100">
            <AlertCircle className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-700">
              Para confirmar: carga el nuevo archivo, pon la fecha de emisión y
              el motivo.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
