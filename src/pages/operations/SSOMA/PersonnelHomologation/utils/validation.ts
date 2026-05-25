import type { PersonnelOperationsByWorkerItemDto } from "@/application";
import { formatMb } from "./helper";

export function validateFile(
  file: File,
  requirement?: PersonnelOperationsByWorkerItemDto | null,
  expirationDate?: string,
) {
  if (!requirement) return "Primero selecciona un requisito.";
  if (!requirement.requiresFile) return "Este requisito no requiere archivo.";

  if (requirement.requiresExpiration && !expirationDate) {
    return "Este requisito exige fecha de vencimiento.";
  }

  const allowed = (requirement.allowedExtensions ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase().replace(".", ""))
    .filter(Boolean);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (allowed.length > 0 && !allowed.includes(ext)) {
    return `Formato no permitido. Solo: ${allowed.join(", ")}`;
  }

  const maxBytes = (requirement.maxFileSize ?? 0) * 1024;
  if (maxBytes > 0 && file.size > maxBytes) {
    return `El archivo supera ${formatMb(requirement.maxFileSize)}`;
  }

  return "";
}
