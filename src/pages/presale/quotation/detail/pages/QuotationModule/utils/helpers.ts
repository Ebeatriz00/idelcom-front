import type { QuotationLine } from "../types";

export function flattenLines(lines: QuotationLine[]) {
  const byParent = new Map<string, QuotationLine[]>();
  const root: QuotationLine[] = [];

  const keyOf = (v: any) => (v == null ? "root" : String(v));

  for (const l of lines) {
    const k = keyOf(l.parentId);
    if (k === "root") root.push(l);
    else {
      if (!byParent.has(k)) byParent.set(k, []);
      byParent.get(k)!.push(l);
    }
  }

  const out: Array<QuotationLine & { indent: number }> = [];

  const walk = (node: QuotationLine, indent: number) => {
    out.push({ ...node, indent });
    const kids = byParent.get(String(node.id)) ?? [];
    for (const k of kids) walk(k, indent + 1);
  };

  for (const r of root) walk(r, 0);

  return out;
}
export function money(n?: number) {
  return (n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const pct = (v?: number) =>
  v == null ? "—" : `${Number(v).toFixed(2)}%`;


export function parseDescripcion(desc?: string) {
  if (!desc) return { title: null, items: [] };

  const lines = desc
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let title: string | null = null;

  if (lines[0] && /:\s*$/.test(lines[0])) {
    title = lines[0];
  }

  const items = lines
    .slice(title ? 1 : 0)
    .filter((l) => /^[-•]\s*/.test(l)) 
    .map((l) => l.replace(/^[-•]\s*/, "").trim());

  return { title, items };
}

export function toneClass(l: QuotationLine) {
  // contenedor siempre azul (estructura)
  if (l.kind !== "ITEM") return "text-blue-700 font-semibold";

  // item preventa rojo
  if (l.isPresalesStrict) return "text-rose-700";

  // item normal negro
  return "text-zinc-900";
}