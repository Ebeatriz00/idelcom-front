import { parseApiError } from "@shared/alerts/apiErros";
import Swal from "sweetalert2";
import { humanDate } from "../utils/helpers";

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export async function showApiError(e: any, fallback = "Ocurrió un error") {
  const parsed = parseApiError(e);

  const isExcel = parsed.topCode === "EXCEL_PARSING_ERROR";
  const subCode = isExcel
    ? parsed.topCode
    : (parsed?.errors?.[0]?.code ??
      (parsed as any)?.errorCode ??
      parsed?.topCode);

  const baseMessage = (parsed.message === "Ha ocurrido un error inesperado." && parsed.details) 
    ? String(parsed.details) 
    : (parsed.message ?? fallback);
    
  const displayMessage = subCode
    ? `Código: <b>${subCode}</b><br>Aviso: ${baseMessage}`
    : baseMessage;

  const devFooter = parsed.details && parsed.message !== "Ha ocurrido un error inesperado."
    ? `Detalles: <code style="white-space:pre-wrap">${String(parsed.details)}</code>`
    : undefined;

  if (parsed.topCode === "AUTH_LOCKED_OUT") {
    const eta =
      typeof parsed.retryAfterMs === "number"
        ? fmt(parsed.retryAfterMs)
        : undefined;
    return Swal.fire({
      icon: "warning",
      title: "Demasiados intentos",
      html: eta
        ? `${displayMessage}<br><small>Reintenta en ~ <b>${eta}</b></small>`
        : displayMessage,
      footer: devFooter,
    });
  }

  switch (parsed.topCode) {
    case "VALIDATION_ERROR":
      return Swal.fire({
        icon: "warning",
        title: "Revisa los datos",
        html: displayMessage,
        footer: devFooter,
      });

    case "DUPLICATE_ENTRY": {
      const baseMessage = parsed.message ?? fallback;
      const [mainPart, lastPart] = baseMessage.split("Última actividad:");

      let lastHtml = "";

      if (lastPart) {
        const match = lastPart.match(/\((.*?)\)/);
        const dateStr = match ? match[1] : null;

        const human = dateStr ? humanDate(dateStr) : null;

        const desc = lastPart
          .replace(/\(.*?\)/, "")
          .trim()
          .replace(/\.*$/, "");

        lastHtml = `
      <br>
      <small>
        Última actividad: ${desc}${human ? ` (${human})` : ""}
      </small>
    `;
      }

      const html = subCode
        ? `Código: <b>${subCode}</b><br>Aviso: ${mainPart.trim()}${lastHtml}`
        : `${mainPart.trim()}${lastHtml}`;

      return Swal.fire({
        icon: "warning",
        title: "Duplicado",
        html,
        footer: devFooter,
      });
    }
    case "CONFLICT":
      return Swal.fire({
        icon: "warning",
        title: "Conflicto",
        html: displayMessage,
        footer: devFooter,
      });

    case "AUTH_INVALID_CREDENTIALS":
      return Swal.fire({
        icon: "warning",
        title: "Credencial invalida",
        html: displayMessage,
        footer: devFooter,
      });

    case "EXCEL_PARSING_ERROR": {
      const code = subCode ?? "EXCEL_PARSING_ERROR";
      const msg = parsed.message ?? fallback;

      const html = `
        <div style="text-align:left; line-height:1.45;">
          <div style="margin-bottom:10px;">
            <span style="display:inline-block; font-size:12px; opacity:.75;">Código</span>
            <div style="font-weight:700; font-size:14px; margin-top:2px;">${code}</div>
          </div>

          <div style="margin:12px 0 0;">
            <div style="font-size:12px; opacity:.75;">Aviso</div>
            <div style="margin-top:4px; font-size:14px;">${msg}</div>
          </div>
        </div>
      `;

      return Swal.fire({
        icon: "warning",
        title: "Archivo Excel inválido",
        html,
        footer: devFooter,
        width: 520,
        padding: "1.25rem",
        confirmButtonText: "OK",
      });
    }

    case "DATABASE_ERROR":
      return Swal.fire({
        icon: "error",
        title: "Error en la base de datos",
        html: displayMessage,
        footer: devFooter,
      });

    case "NOT_FOUND":
      return Swal.fire({
        icon: "warning",
        title: "No encontrado",
        html: displayMessage,
      });

    case "UNAUTHORIZED":
      return Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        html: "Vuelve a iniciar sesión.",
      });

    case "FORBIDDEN":
      return Swal.fire({
        icon: "warning",
        title: "Sin permiso",
        html: "No tienes acceso a esta acción.",
      });
  }

  if (parsed.httpStatus === 404)
    return Swal.fire({
      icon: "warning",
      title: "No encontrado",
      html: displayMessage,
    });
  if (parsed.httpStatus === 401)
    return Swal.fire({
      icon: "warning",
      title: "Sesión expirada",
      html: "Vuelve a iniciar sesión.",
    });
  if (parsed.httpStatus === 403)
    return Swal.fire({
      icon: "warning",
      title: "Sin permiso",
      html: "No tienes acceso a esta acción.",
    });

  if (parsed.httpStatus === 422 && /excel/i.test(parsed.message ?? "")) {
    return Swal.fire({
      icon: "warning",
      title: "Archivo Excel inválido",
      html: displayMessage,
      footer: devFooter,
    });
  }

  // Default (500, etc.)
  return Swal.fire({
    icon: "error",
    title: "Ups…",
    html: displayMessage,
    footer: parsed.topCode ? `Código: <b>${parsed.topCode}</b>` : undefined,
  });
}
