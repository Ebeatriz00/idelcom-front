export type Props = {
  selectedVerId: string;
  versionNo?: string;
};

export type EgressLineDto = {
  tempLineNo?: number | null;
  lineNo: number;
  monthNo: number; // 0..11
  amount: number;
};

export type EgressMonthDto = {
  monthNo: number; // 0..11
  amount: number;
  lines: EgressLineDto[];
};

export type PlanLine = {
  seqNo: number;
  paymentPercent: number;
  paymentAmount: number;
};

export type Plan = {
  linePlanId?: number | null;
  monthNo?: number | null;
  lines: PlanLine[];
};

export type LineKind = "GROUP" | "PARENT" | "ITEM";

export type QuotationLine = {
  id: number | string;
  parentId?: number | string | null;

  displayNo: string;
  levelNo: number;
  description: string;

  typeName?: string;
  uomName?: string;
  brandName?: string;
  modelName?: string;
  qty?: number;
  unitPrice?: number;
  totalPrice?: number;
  lineAmount?: number;

  kind: LineKind;
  isCollapsible: boolean;
  isChild: boolean;
  isRollUp: boolean;
  // ✅ PREVENTA real (para pintar)
  isPresalesStrict: boolean;
  isPresales: boolean;
  // ✅ MIXTO/INFO PREVENTA (para tablas, no para pintar)
  hasPresalesData: boolean;
  hasPresalesValues?: boolean;

  assignedTo?: string | null;
  presalesAssignedId?: number | null;
  systemName?: string | null;
  suppliersName?: string | null;
  deliveryDays?: string | null;
  pmConditionName?: string | null;

  unitCost?: number;
  unitSalePrice?: number;
  lineCostTotal?: number;
  lineSaleTotal?: number;
  margenPorcentLine?: number;
};

export function mapDtoLinesToUi(lines: any[] = []): QuotationLine[] {
  return lines.map((x) => {
    const lineType = String(x.lineType ?? "").toUpperCase();
    const isRollUp = Boolean(x.isRollUp);

    const id = String(x.quotationVerLinId ?? `${x.quotationVerId}:${x.lineNo}`);
    const parentId =
      x.parentQuotationVerLinId != null ? String(x.parentQuotationVerLinId) : null;

    const displayNo = String(x.displayNo ?? x.DisplayNo ?? "").trim();
    const depth = depthFromDisplayNo(displayNo);

    const moneyQty = hasMoneyOrQty(x);

    // ✅ CONTENEDOR si:
    // - marcado como rollup, o
    // - no tiene montos (título), o
    // - lineType estructural
    const isContainer =
      isRollUp ||
      !moneyQty ||
      lineType === "PARENT" ||
      lineType === "CHILD" ||
      lineType === "GROUP";

    // ✅ KIND
    const kind: LineKind = isContainer ? (lineType === "GROUP" ? "GROUP" : "PARENT") : "ITEM";

    // ✅ level: usa depth si existe, si no, hereda de backend
    // para textos sin numeración: usa backend levelNo o 3 por defecto
    const levelNo =
      depth > 0 ? depth : Number(x.levelNo ?? 3);

    // ✅ child real
    const isChild = parentId != null && kind === "ITEM";

    // ✅ preventa strict
    const isPresalesStrict = x.isPresales === true || Number(x.isPresales) === 1;

    // (mantengo tu lógica de hasPresalesData igual)
    const assignedTo = String(x.presalesAssignedTo ?? "").trim() || null;
    const presalesAssignedId =
      x.presalesAssignedId != null ? Number(x.presalesAssignedId) : null;

    const unitCost = x.unitCost != null ? Number(x.unitCost) : null;
    const lineCostTotal = x.lineCostTotal != null ? Number(x.lineCostTotal) : null;

    const hasPresalesCost = (unitCost ?? 0) > 0 || (lineCostTotal ?? 0) > 0;
    const hasPresalesAssignment =
      Boolean(assignedTo) ||
      (typeof presalesAssignedId === "number" && presalesAssignedId > 0);

    const hasPresalesData = hasPresalesAssignment || hasPresalesCost;
    const isPresales = isPresalesStrict || hasPresalesData;

    // ✅ collapsable SOLO si es contenedor (no items reales)
    const isCollapsible = isContainer;

    return {
      id,
      parentId,
      displayNo,
      levelNo,
      description: String(x.description ?? "").trim(),

      typeName: String(x.productsTypeName ?? "").trim(),
      uomName: String(x.uomName ?? "").trim(),
      brandName: String(x.brands ?? "").trim(),
      modelName: String(x.model ?? "").trim(),

      qty: x.qty ?? 0,
      unitPrice: x.unitPrice ?? 0,
      totalPrice: x.totalPrice ?? 0,
      lineAmount: x.lineAmount ?? null,

      kind,
      isCollapsible,
      isChild,
      isRollUp,
      isPresalesStrict,
      isPresales,
      hasPresalesData,

      assignedTo,
      presalesAssignedId,

      systemName: x.systemName,
      suppliersName: x.suppliersName,
      deliveryDays: x.deliveryDays,

      unitCost: unitCost ?? 0,
      unitSalePrice: x.unitSalePrice != null ? Number(x.unitSalePrice) : 0,
      lineCostTotal: lineCostTotal ?? 0,
      lineSaleTotal: x.lineSaleTotal != null ? Number(x.lineSaleTotal) : 0,
      margenPorcentLine: x.margenPorcentLine != null ? Number(x.margenPorcentLine) : 0,
    };
  });
}
export function inferLevelFromDisplayNo(displayNo: string): number {
  const s = String(displayNo ?? "")
    .trim()
    .replace(/\s+/g, "");
  if (!s) return 0;

  const parts = s.split(/[.\-\/]+/).filter(Boolean);
  return parts.length || 0;
}

export function depthFromDisplayNo(displayNo: string) {
  const s = String(displayNo ?? "").trim();
  if (!s) return 0;
  // 07.02.07.01.01 / C.40.04.02.04
  return s.split(".").filter(Boolean).length;
}

export function hasMoneyOrQty(x: any) {
  const qty = x.qty ?? x.quantity;
  const u = x.unitPrice;
  const t = x.totalPrice;
  const a = x.lineAmount;

  return (
    (qty != null && Number(qty) > 0) ||
    (u != null && Number(u) > 0) ||
    (t != null && Number(t) > 0) ||
    (a != null && Number(a) > 0)
  );
}


export function buildVisibleRows(
  all: QuotationLine[],
  collapsed: Set<string | number>,
): QuotationLine[] {
  const byParent = new Map<string, QuotationLine[]>();
  const roots: QuotationLine[] = [];
  const out: QuotationLine[] = [];

  const isCollapsed = (id: string | number) => collapsed.has(String(id));

  for (const l of all) {
    const pid = l.parentId == null ? null : String(l.parentId);

    if (pid == null) roots.push(l);
    else {
      const arr = byParent.get(pid) ?? [];
      arr.push(l);
      byParent.set(pid, arr);
    }
  }

  // ✅ orden por lineNo si lo tienes; sino por displayNo
  const sortArr = (arr: QuotationLine[]) =>
    arr.sort((a, b) => {
      // si tienes lineNo en UI úsalo acá (mejor)
      return (a.displayNo || "").localeCompare(b.displayNo || "", "es", {
        numeric: true,
      });
    });

  sortArr(roots);
  for (const arr of byParent.values()) sortArr(arr);

  const dfs = (node: QuotationLine) => {
    out.push(node);

    // SOLO corta si es collapsible
    if (node.isCollapsible && isCollapsed(node.id)) return;

    const kids = byParent.get(String(node.id)) ?? [];
    for (const k of kids) dfs(k);
  };

  for (const r of roots) dfs(r);

  return out;
}
