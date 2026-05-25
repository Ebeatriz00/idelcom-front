export type StateColorKey =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary"
  | "secondary"
  | string;

export type ColorKind = "bg" | "text" | "border" | "ring";

export interface ColorMap {
  bg: string;
  text: string;
  border: string;
  ring: string;
}

const BASE_COLOR_MAP: Record<string, ColorMap> = {
  success:   { bg: "bg-emerald-500", text: "text-white",  border: "border-emerald-500", ring: "ring-emerald-500/30" },
  warning:   { bg: "bg-amber-500",   text: "text-white",  border: "border-amber-500",   ring: "ring-amber-500/30" },
  danger:    { bg: "bg-red-500",     text: "text-white",  border: "border-red-500",     ring: "ring-red-500/30" },
  info:      { bg: "bg-blue-500",    text: "text-white",  border: "border-blue-500",    ring: "ring-blue-500/30" },
  primary:   { bg: "bg-slate-900",   text: "text-white",  border: "border-slate-900",   ring: "ring-slate-900/20" },
  secondary: { bg: "bg-slate-600",   text: "text-white",  border: "border-slate-600",   ring: "ring-slate-600/20" },
  neutral:   { bg: "bg-slate-400",   text: "text-slate-900", border: "border-slate-300", ring: "ring-slate-300/20" },
};

let COLOR_MAP: Record<string, ColorMap> = { ...BASE_COLOR_MAP };
const FALLBACK = COLOR_MAP.neutral;

// Para colores hexadecimales personalizados (solo cacheamos por si acaso)
const CUSTOM_COLORS = new Map<string, ColorMap>();

const HEX_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
// Si el back manda clases tailwind puras
const TAILWIND_CLASS_RE = /\b(bg-|text-|border-|ring-)/;

/**
 * Normaliza un token de color que puede venir del back como:
 * - nombre semántico: "success"
 * - hex: "#0D4C9C"
 * - clases tailwind: "bg-emerald-500 text-white"
 *
 * Devuelve className + style para usar directamente en el componente.
 */
export function resolveStateColor(
  key?: StateColorKey,
  kind: ColorKind = "bg"
): { className: string; style?: React.CSSProperties } {
  if (!key) {
    return { className: FALLBACK[kind] };
  }

  // 1) Si es HEX
  if (HEX_RE.test(key)) {
    const style: React.CSSProperties = {};

    if (kind === "bg") {
      style.backgroundColor = key;       // solo fondo
      return { className: "", style };
    }

    if (kind === "text") {
      // texto fijo sobre fondo custom
      return { className: "text-white" }; // o "text-slate-50"
    }

    if (kind === "border") {
      style.borderColor = key;
      return { className: "", style };
    }

    // ring lo puedes manejar a gusto
    return { className: "" };
  }

  // 2) Si parece clases tailwind completas
  if (TAILWIND_CLASS_RE.test(key) || key.includes(" ")) {
    return { className: key };
  }

  // 3) Clave semántica
  const entry = COLOR_MAP[key] ?? FALLBACK;
  return { className: entry[kind] };
}

// API vieja, por si no quieres romper todo de golpe
export function getStateColorClass(
  key?: StateColorKey,
  kind: ColorKind = "bg"
): string {
  const { className } = resolveStateColor(key, kind);
  return className || ""; // para hex devolverá ""
}

export function extendStateColors(partial: Record<string, ColorMap>) {
  COLOR_MAP = { ...COLOR_MAP, ...partial };
}

export function resetStateColors() {
  COLOR_MAP = { ...BASE_COLOR_MAP };
  CUSTOM_COLORS.clear();
}
