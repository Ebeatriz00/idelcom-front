export type CollapsibleRow = {
  id: string | number;
  parentId?: string | number | null;
  levelNo: number;
  isCollapsible: boolean;
  itemId?: string | number;
};

const norm = (v: any) => (v == null ? null : String(v));

export function computeDescCount<T extends CollapsibleRow>(rows: T[]) {
  const childrenByParent = new Map<string, T[]>();
  const roots: T[] = [];

  for (const r of rows) {
    const pid = norm(r.parentId);
    if (pid == null) roots.push(r);
    else {
      const arr = childrenByParent.get(pid) ?? [];
      arr.push(r);
      childrenByParent.set(pid, arr);
    }
  }

  const desc = new Map<T["id"], number>();

  const count = (node: T): number => {
    const kids = childrenByParent.get(String(node.id)) ?? [];
    let total = 0;
    for (const k of kids) total += 1 + count(k);
    desc.set(node.id, total);
    return total;
  };

  for (const r of roots) count(r);
  return desc;
}

export function filterVisibleRows<T extends CollapsibleRow>(
  rows: T[],
  collapsed: Set<T["id"]>,
) {
  const childrenByParent = new Map<string, T[]>();
  const roots: T[] = [];

  // mantiene el orden original
  const pos = new Map<string, number>();
  rows.forEach((r, i) => pos.set(String(r.id), i));

  const ids = new Set(rows.map((r) => String(r.id)));

  for (const r of rows) {
    const pid = norm(r.parentId);

    if (pid == null || !ids.has(pid)) {
      roots.push(r); // ✅ huérfano como root
      continue;
    }

    const arr = childrenByParent.get(pid) ?? [];
    arr.push(r);
    childrenByParent.set(pid, arr);
  }

  const sortByPos = (arr: T[]) =>
    arr.sort(
      (a, b) => (pos.get(String(a.id)) ?? 0) - (pos.get(String(b.id)) ?? 0),
    );

  sortByPos(roots);
  for (const arr of childrenByParent.values()) sortByPos(arr);

  const isCollapsed = (id: any) => collapsed.has(String(id) as any);

  const out: T[] = [];
  const dfs = (node: T) => {
    out.push(node);
    if (node.isCollapsible && isCollapsed(node.id)) return;

    const kids = childrenByParent.get(String(node.id)) ?? [];
    for (const k of kids) dfs(k);
  };

  for (const r of roots) dfs(r);
  return out;
}

export function computeDxescCount<T extends CollapsibleRow>(rows: T[]) {
  const desc = new Map<T["id"], number>();
  const stack: { id: T["id"]; level: number }[] = [];

  for (const r of rows) {
    while (stack.length && r.levelNo <= stack[stack.length - 1].level) {
      stack.pop();
    }

    for (const g of stack) {
      desc.set(g.id, (desc.get(g.id) ?? 0) + 1);
    }

    if (r.isCollapsible) stack.push({ id: r.id, level: r.levelNo });
  }

  return desc;
}

/**
 * O(n): filtra filas visibles según grupos colapsados.
 * Idea: si un grupo está colapsado, todo lo que tenga level > levelDelGrupo queda oculto
 * hasta que aparezca una fila con level <= levelDelGrupo.
 */
export function filterxVisibleRows<T extends CollapsibleRow>(
  rows: T[],
  collapsed: Set<T["id"]>,
) {
  const out: T[] = [];
  const stack: { level: number; isCollapsed: boolean }[] = [];
  let collapsedDepth = 0;

  for (const r of rows) {
    while (stack.length && r.levelNo <= stack[stack.length - 1].level) {
      const popped = stack.pop()!;
      if (popped.isCollapsed) collapsedDepth--;
    }

    if (collapsedDepth === 0) out.push(r);

    if (r.isCollapsible) {
      const isCol = collapsed.has(r.id);
      stack.push({ level: r.levelNo, isCollapsed: isCol });
      if (isCol) collapsedDepth++;
    }
  }

  return out;
}
