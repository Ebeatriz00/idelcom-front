import type { PersonnelOperationsByWorkerItemDto } from "@/application";
import type { PersonnelHomologationFormDefaultValues } from "./TypesPersonnel";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid as isValidDate,
  parseISO,
} from "date-fns";

export function getInitials(fullName?: string) {
  if (!fullName?.trim()) return "--";
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getStatusTone(status?: string) {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("aprob") ||
    normalized.includes("vigente") ||
    normalized.includes("activo")
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    normalized.includes("pend") ||
    normalized.includes("revisi") ||
    normalized.includes("proceso")
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    normalized.includes("rechaz") ||
    normalized.includes("venc") ||
    normalized.includes("observ")
  ) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function formatValue(value?: string) {
  return value?.trim() ? value : "-";
}

export function parseDateValue(value?: string) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const isoDate = parseISO(normalized);
  if (isValidDate(isoDate)) return isoDate;

  const localParts = normalizeDateParts(normalized);
  if (!localParts) return null;

  const localDate = new Date(
    localParts.year,
    localParts.month - 1,
    localParts.day,
  );

  return isValidDate(localDate) ? localDate : null;
}

export function calculateExpirationDate(issueDate?: string, duration?: number) {
  const sourceDate = parseDateValue(issueDate);
  const validDuration = Number(duration || 0);

  if (!sourceDate || validDuration <= 0) return "";
  return format(addDays(sourceDate, validDuration), "yyyy-MM-dd");
}

export function resolveRequirementDuration(
  configuredDuration?: unknown,
  fallbackDuration?: unknown,
  originalIssueDate?: string,
  originalExpirationDate?: string,
) {
  const parsedConfiguredDuration = Number(configuredDuration || 0);
  if (parsedConfiguredDuration > 0) return parsedConfiguredDuration;

  const parsedFallbackDuration = Number(fallbackDuration || 0);
  if (parsedFallbackDuration > 0) return parsedFallbackDuration;

  const parsedIssueDate = parseDateValue(originalIssueDate);
  const parsedExpirationDate = parseDateValue(originalExpirationDate);

  if (
    parsedIssueDate &&
    parsedExpirationDate &&
    isValidDate(parsedIssueDate) &&
    isValidDate(parsedExpirationDate)
  ) {
    const derivedDuration = differenceInCalendarDays(
      parsedExpirationDate,
      parsedIssueDate,
    );

    if (derivedDuration > 0) return derivedDuration;
  }

  return 0;
}

function normalizeDateParts(value: string) {
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (!match) return null;

  const [, first, second, yearRaw] = match;
  const day = Number(first);
  const month = Number(second);
  const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);

  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { day, month, year };
}

export function parseExpirationDate(value?: string) {
  if (!value?.trim()) return null;

  const normalizedValue = value.trim();
  const localParts = normalizeDateParts(normalizedValue);

  if (localParts) {
    return new Date(localParts.year, localParts.month - 1, localParts.day);
  }

  const parsed = new Date(normalizedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getExpirationBadge(value?: string) {
  const expirationDate = parseExpirationDate(value);

  if (!expirationDate) {
    return {
      label: "Sin fecha",
      className: "bg-slate-100 text-slate-700",
    };
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const expirationStart = new Date(
    expirationDate.getFullYear(),
    expirationDate.getMonth(),
    expirationDate.getDate(),
  );
  const diffInDays = Math.ceil(
    (expirationStart.getTime() - todayStart.getTime()) / 86400000,
  );

  if (diffInDays < 0) {
    return {
      label: "Vencido",
      className: "bg-red-50 text-red-600 border border-red-200",
    };
  }

  if (diffInDays <= 30) {
    return {
      label: "Por vencer",
      className: "bg-amber-50 text-amber-600 border border-amber-200",
    };
  }

  return {
    label: "Vigente",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  };
}

function toDateInputValue(value?: string | Date) {
  if (!value) return "";

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const normalized = String(value).trim();
  if (!normalized) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapRequirementToDocument(
  item: PersonnelOperationsByWorkerItemDto,
) {
  const useOperationSource = item.sourceType?.toLowerCase() === "operation";

  const fileName = useOperationSource
    ? (item.operationFileName ?? item.internalFileName ?? "")
    : (item.internalFileName ?? item.operationFileName ?? "");

  const fileUrl = useOperationSource
    ? (item.operationFileUrl ?? item.internalFileUrl ?? "")
    : (item.internalFileUrl ?? item.operationFileUrl ?? "");

  const filePath = useOperationSource
    ? (item.operationFilePath ?? item.internalFilePath ?? "")
    : (item.internalFilePath ?? item.operationFilePath ?? "");

  const issueDate = useOperationSource
    ? toDateInputValue(item.operationIssueDate)
    : toDateInputValue(item.internalIssueDate);

  const expirationDate = useOperationSource
    ? toDateInputValue(item.operationlExpirationDate)
    : toDateInputValue(item.internalExpirationDate);

  const reviewDate = useOperationSource
    ? toDateInputValue(item.operationReviewDate)
    : toDateInputValue(item.internalReviewDate);

  const validationStatusId = useOperationSource
    ? (item.operationValidationStatusId ?? item.internalValidationStatusId)
    : (item.internalValidationStatusId ?? item.operationValidationStatusId);

  const observation = useOperationSource
    ? String(item.operationObservation ?? "")
    : (item.internalObservation ?? "");

  const homologationPersonnelId = useOperationSource
    ? (item.operationDocumentId ?? item.internalDocumentId)
    : (item.internalDocumentId ?? item.operationDocumentId);

  return {
    homologationPersonnelId,
    requirementId: item.requirementId,
    fileName,
    fileUrl,
    filePath,
    localUploadToken: "",
    issueDate,
    expirationDate,
    validationStatusId: validationStatusId ?? 0,
    reviewDate,
    observation,
  };
}

export function buildPersonnelHomologationCreateDefaults(
  homologationScopeId?: number,
  workerId?: number,
  requirementRows: PersonnelOperationsByWorkerItemDto[] = [],
): PersonnelHomologationFormDefaultValues {
  return {
    homologationPersonnel: {
      homologationScopeId: homologationScopeId || undefined,
      workerId: workerId || undefined,
    },
    documents: requirementRows.map(mapRequirementToDocument),
  };
}

export function formatMb(kb?: number) {
  if (!kb) return "-";
  return `${(kb / 1024).toFixed(2)} MB`;
}
