
export function statusToBool(status: unknown): boolean {
  const v = String(status ?? "").trim().toUpperCase();
  return (
    v === "1" ||
    v === "TRUE" ||
    v === "ACTIVO" ||
    v === "ACTIVE" ||
    v === "SI" ||
    v === "SÍ" ||
    v === "YES"
  );
}
export function boolToStatusString(active: boolean): "1" | "0" {
  return active ? "1" : "0";
}
