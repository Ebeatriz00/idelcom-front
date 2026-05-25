export const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtPct = (n: number) => `${(n ?? 0).toFixed(2)}%`;

export function fmtText(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export function fmtDate(v: unknown, fallback = "—") {
  if (!v) return fallback;

  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return fallback;

  return new Intl.DateTimeFormat("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
