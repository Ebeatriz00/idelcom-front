import type { QuotationLine } from "../types";

/**
 * Retorna SOLO:
 * - ITEM rojos (hasPresalesData)
 * - sus ancestros (PARENT/GROUP) para mantener contexto
 *
 * Mantiene orden original (flat).
 */
export function filterNormalTree(rows: QuotationLine[]) {
  const byId = new Map<string | number, QuotationLine>();
  for (const r of rows) byId.set(r.id, r);

  const keep = new Set<string | number>();

  const isStructural = (r: QuotationLine) =>
    r.isCollapsible || r.isRollUp || r.kind === "PARENT" || r.kind === "GROUP";

  const isNormalItem = (r: QuotationLine) =>
    r.kind === "ITEM" && !r.isRollUp && !r.isPresalesStrict; // item real negro

  // 1) marca items negros + todos sus ancestros (sin mirar color del ancestro)
  for (const r of rows) {
    if (!isNormalItem(r)) continue;

    keep.add(r.id);

    let pid = r.parentId ?? null;
    while (pid != null) {
      keep.add(pid);
      const parent = byId.get(pid);
      pid = parent?.parentId ?? null;
    }
  }

  // 2) filtra:
  // - todo lo estructural que esté marcado (aunque sea rojo)
  // - items: solo negros
  return rows.filter((r) => {
    if (!keep.has(r.id)) return false;
    if (isStructural(r)) return true;
    return isNormalItem(r);
  });
}

export function filterPresalesTree(rows: QuotationLine[]) {
  const byId = new Map<string | number, QuotationLine>();
  for (const r of rows) byId.set(r.id, r);

  const keep = new Set<string | number>();

  const isPresalesItem = (r: QuotationLine) => !r.isRollUp && r.isPresalesStrict;

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

  return rows.filter((r) => {
    if (!keep.has(r.id)) return false;
    if (r.isRollUp || r.isCollapsible) return true;
    return isPresalesItem(r);
  });
}

export function filterNoTree(rows: QuotationLine[]) {
  const byId = new Map<string | number, QuotationLine>();
  for (const r of rows) byId.set(r.id, r);

  const keep = new Set<string | number>();

  for (const r of rows) {
    const isWantedItem = r.kind === "ITEM" && !r.isPresales; // ✅ NO preventa
    if (!isWantedItem) continue;

    keep.add(r.id);

    let pid = r.parentId ?? null;
    while (pid != null) {
      keep.add(pid);
      const parent = byId.get(pid);
      pid = parent?.parentId ?? null;
    }
  }

  return rows.filter((r) => {
    if (!keep.has(r.id)) return false;
    if (r.kind === "ITEM") return !r.isPresales; // ✅ solo items NO preventa
    return true; // contenedores
  });
}