export function fmtDate(input: unknown) {
  try {
    const raw = String(input ?? "").trim();
    const ymdMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const d = input instanceof Date
      ? input
      : ymdMatch
        ? new Date(
            Number(ymdMatch[1]),
            Number(ymdMatch[2]) - 1,
            Number(ymdMatch[3]),
          )
        : new Date(raw);
    if (isNaN(d.getTime())) return input as any;
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return input as any;
  }
}

export function stateColor(state?: string | null) {
  const s = (state ?? "").toLowerCase();
  if (s.includes("gana") || s.includes("aprob")) return "emerald";
  if (s.includes("coti") || s.includes("eval")) return "indigo";
  if (s.includes("pend") || s.includes("aten")) return "amber";
  if (s.includes("rechaz") || s.includes("perd")) return "rose";
  return "indigo";
}
export function parsePeruDate(str: string): Date | null {
  const [datePart, timePart] = str.split(" ");
  if (!datePart || !timePart) return null;

  const [dd, MM, yyyy] = datePart.split("/").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);

  if (!dd || !MM || !yyyy) return null;

  return new Date(yyyy, MM - 1, dd, hh || 0, mm || 0, 0);
}

export function humanDate(dateStr: string): string {
  const d = parsePeruDate(dateStr);
  if (!d) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Hace 1 semana";
  if (weeks < 5) return `Hace ${weeks} semanas`;

  const months = Math.floor(days / 30);
  if (months === 1) return "Hace 1 mes";
  if (months < 12) return `Hace ${months} meses`;

  const years = Math.floor(days / 365);
  return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
}
export function parseEsDateTime(s: string): Date | null {
  if (!s) return null;

  // "31/1/2026, 0:00:00."
  const cleaned = s.trim().replace(/\.$/, ""); // quita el punto final
  const [datePart, timePartRaw] = cleaned.split(",").map((x) => x.trim());
  if (!datePart) return null;

  const [dd, mm, yyyy] = datePart.split("/").map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;

  const timePart = timePartRaw ?? "0:0:0";
  const [HH, MM, SS] = timePart.split(":").map((x) => Number(x));

  if ([HH, MM, SS].some((n) => Number.isNaN(n))) return null;

  // OJO: month en JS es 0-based
  const d = new Date(yyyy, mm - 1, dd, HH, MM, SS, 0);
  return isNaN(d.getTime()) ? null : d;
}

export const toYMD = (v: unknown) => {
  if (!v) return null;
  const s = String(v);
  return s.includes("T") ? s.split("T")[0] : s.slice(0, 10);
};

export const parseYMDLocal = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); // local date
};

// Convierte Date -> YYYY-MM-DD en LOCAL (sin toISOString)
export const dateToLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
