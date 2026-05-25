import type { QuotationLine } from "../types";

type PresalesMode = "strict" | "withMixed";

/**
 * Retorna filas en el orden original, pero solo:
 * - ITEMS preventa (strict o mixto)
 * - + sus ancestros (PARENT/GROUP) para que se vea jerarquía.
 */
export function pickPresalesTree(
  rows: QuotationLine[],
  mode: PresalesMode = "withMixed"
) {
  const isPresalesItem = (r: QuotationLine) => {
    if (r.kind !== "ITEM") return false;

    if (mode === "strict") return r.isPresalesStrict; // ✅ backend only
    return r.isPresales; // ✅ strict OR data (incluye Contingencia)
  };

  const byId = new Map<string | number, QuotationLine>();
  for (const r of rows) byId.set(r.id, r);

  const keep = new Set<string | number>();

  for (const r of rows) {
    if (!isPresalesItem(r)) continue;

    keep.add(r.id);

    let pid = r.parentId ?? null;
    while (pid != null) {
      keep.add(pid);
      const parent = byId.get(pid);
      pid = parent?.parentId ?? null;
    }
  }

  return rows.filter((r) => keep.has(r.id));
}
