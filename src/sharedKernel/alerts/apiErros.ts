import type {
  ApiErrorItem,
  GlobalError,
  ParsedApiError,
} from "@shared/globalErrorDetail";

function parseRetryAfterMs(headers?: Record<string, any>): number | undefined {
  if (!headers) return;
  // Axios normaliza a lowercase
  const raw = headers["retry-after"] ?? headers["Retry-After"];
  if (!raw) return;

  // 1) segundos
  if (/^\d+$/.test(String(raw))) return parseInt(String(raw), 10) * 1000;

  // 2) fecha RFC 7231
  const t = new Date(String(raw)).getTime();
  if (!Number.isNaN(t)) return Math.max(0, t - Date.now());
  return;
}

export function parseApiError(e: any): ParsedApiError {
  if (
    !e?.response &&
    (e?.code === "ECONNABORTED" ||
      e?.code === "ETIMEDOUT" ||
      e?.message?.toLowerCase?.().includes("timeout"))
  ) {
    return {
      topCode: "REQUEST_TIMEOUT",
      message:
        "El servidor no respondio a tiempo. Intenta nuevamente en unos segundos.",
      errors: [],
    };
  }

  if (!e?.response && (e?.code === "ERR_NETWORK" || e?.isNetworkError)) {
    return {
      topCode: "NETWORK_ERROR",
      message:
        "No se pudo conectar con el servidor. Verifica la conexion e intenta nuevamente.",
      errors: [],
    };
  }

  const res = e?.response;
  const data: Partial<GlobalError> = res?.data ?? e?.data ?? e ?? {};

  const httpStatus =
    res?.status ??
    (data as any)?.statusCode ??
    (data as any)?.StatusCode ??
    (data as any)?.httpStatus;

  const topCode =
    (data as any)?.Code ??
    (data as any)?.code ??
    (data as any)?.topCode ??
    (data as any)?.errorCode;
  const topMessage = (data as any)?.Message ?? (data as any)?.message;
  const details = (data as any)?.details ?? (data as any)?.Details;

  const rawErrors = Array.isArray((data as any)?.errors)
    ? (data as any).errors
    : Array.isArray((data as any)?.Errors)
      ? (data as any).Errors
      : [];

  const errors: ApiErrorItem[] = rawErrors.map((it: any) => ({
    code: it?.code ?? it?.Code ?? "",
    message: it?.message ?? it?.Message ?? "Error",
    field: it?.field ?? it?.Field,
  }));

  const fieldErrors: Record<string, string> = {};
  for (const err of errors) {
    if (err.field) fieldErrors[err.field] = err.message || "Dato inválido";
  }

  const firstMsg = errors[0]?.message;
  const fallbackMsg = topMessage ?? e?.message ?? "Ocurrió un error";

  const retryAfterMs = parseRetryAfterMs(res?.headers);
  const retryUntil = retryAfterMs ? Date.now() + retryAfterMs : undefined;

  return {
    httpStatus,
    topCode,
    message: firstMsg || fallbackMsg,
    errors,
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    details,
    retryAfterMs,
    retryUntil,
  };
}
