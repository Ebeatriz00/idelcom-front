import type { ModulesResponseDto } from "@/application";
import type { TreeData, TreeNode } from "../types";

export type BuildTreeOptions = {
  onOrphan?: "asRoot" | "discard";
  sort?: { by?: Array<"orderNo" | "label">; direction?: "asc" | "desc" };
};

const normPid = (pid: number | null | undefined) =>
  pid == null || pid === 0 ? null : pid;

export function buildTreeData(
  rows: ModulesResponseDto[],
  options?: BuildTreeOptions | null // 👈 acepta null también
): TreeData {
  // 👇 normalizamos options para evitar destructuring sobre null
  const opts: BuildTreeOptions = options ?? {};
  const onOrphan = opts.onOrphan ?? "asRoot";
  const sortCfg = opts.sort ?? {
    by: ["orderNo", "label"],
    direction: "asc" as const,
  };

  const byId = new Map<number, TreeNode>();
  const parentOf = new Map<number, number | null>();
  const roots: TreeNode[] = [];

  // Mapeo base
  for (const m of rows) {
    byId.set(m.modulesId, {
      id: m.modulesId,
      label: (m as any).label ?? m.modulesName ?? String(m.modulesId),
      icon: m.icon ?? (m as any).icon ?? null,
      path: m.path ?? null,
      status: m.status,
      orderNo: m.orderNo ?? 0,
      code: m.code,
      parentId: normPid((m as any).parentId),
      children: [],
    });
  }

  // Enlace padre-hijo
  for (const node of byId.values()) {
    const pid = node.parentId;
    const parent = pid != null ? byId.get(pid) : null;

    if (parent) {
      parent.children.push(node);
      parentOf.set(node.id, parent.id);
    } else {
      if (onOrphan === "discard" && pid != null) continue;
      roots.push(node);
      parentOf.set(node.id, null);
    }
  }

  // Orden
  const cmp = (a: TreeNode, b: TreeNode) => {
    const fields = sortCfg.by ?? ["orderNo", "label"];
    for (const f of fields) {
      const av = f === "orderNo" ? a.orderNo : a.label ?? "";
      const bv = f === "orderNo" ? b.orderNo : b.label ?? "";
      if (av < bv) return sortCfg.direction === "desc" ? 1 : -1;
      if (av > bv) return sortCfg.direction === "desc" ? -1 : 1;
    }
    return 0;
  };
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort(cmp);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return { roots, byId, parentOf };
}
