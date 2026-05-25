import type { Paged } from "./export/types";

export function maskKey(raw: string) {
  const s = raw.replace(/\s+/g, "").toUpperCase();
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}-••••-••••-••••-${s.slice(-4)}`;
}
export function daysBetween(a: Date, b: Date) {
  const ms = Math.max(0, b.getTime() - a.getTime());
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
export function formatCurrencyTag(code: string) {
  switch (code) {
    case "PEN":
      return "S/ PEN";
    case "USD":
      return "US$ USD";
    case "EUR":
      return "€ EUR";
    default:
      return code;
  }
}

export function normFree(s?: string | null) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "dwg",
  "dxf",
  "dwt",
  "dwf",
  "msg",
  "zip",
  "rar",
] as const;

export const MAX_SIZE_MB = 200;

export const INPUT_ACCEPT = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".dwg",
  ".dxf",
  ".dwt",
  ".dwf",
  ".msg",
  ".zip",
  ".rar",
].join(",");

export function pickItems<T>(r: Paged<T>): T[] {
  return (r.data ?? r.items ?? []) as T[];
}
// ========== Utilidades comunes ==========
export function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function escapeCSV(val: string) {
  const needsQuotes = /[",\n]/.test(val);
  const safe = val.replace(/"/g, '""');
  return needsQuotes ? `"${safe}"` : safe;
}

export function toStr(v: unknown) {
  if (v == null) return "";
  return String(v);
}
