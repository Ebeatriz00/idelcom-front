// validateFiles.ts
type ValidationResult = {
  valid: File[];
  rejected: { file: File; reason: string }[];
};

const toExt = (name: string) =>
  (name.split(".").pop() || "").toLowerCase().trim();

export function validateFiles(
  files: File[],
  allowedExts: readonly string[],
  maxSizeMB: number
): ValidationResult {
  const allowed = new Set(allowedExts.map(e => e.toLowerCase()));
  const maxBytes = maxSizeMB * 1024 * 1024;

  const valid: File[] = [];
  const rejected: { file: File; reason: string }[] = [];

  for (const f of files) {
    const ext = toExt(f.name);
    if (!allowed.has(ext)) {
      rejected.push({ file: f, reason: `Extensión no permitida (.${ext})` });
      continue;
    }
    if (f.size > maxBytes) {
      rejected.push({
        file: f,
        reason: `Excede ${maxSizeMB} MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`
      });
      continue;
    }
    valid.push(f);
  }

  return { valid, rejected };
}
