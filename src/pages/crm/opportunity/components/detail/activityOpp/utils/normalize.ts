// utils/normalize.ts
export type RangeQuick =
  | "todas"
  | "hoy"
  | "semana"
  | "mes"
  | "vencidas"
  | "completadas";

export function normState(s?: string) {
  const v = (s ?? "").trim().toLowerCase();
  if (v.startsWith("comp")) return "completada";
  if (v.startsWith("canc")) return "cancelada";
  return "pendiente";
}
export function normType(s?: string) {
  const v = (s ?? "").trim().toLowerCase();
  if (v.startsWith("llam")) return "llamada";
  if (v.startsWith("reun") || v === "reunion") return "reunión";
  if (v.startsWith("tar")) return "tarea";
  if (v.startsWith("em") || v.includes("mail")) return "email";
  return "otro";
}
