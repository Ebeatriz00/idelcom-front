import type { FlatEntry, TrailItem, TreeNode } from "../types";

/**
 * Aplana el árbol devolviendo pares { node, trail }.
 * El trail NO incluye al propio nodo.
 */
export function flattenTree(
  nodes: TreeNode[],
  parentTrail: TrailItem[] = []
): FlatEntry[] {
  const out: FlatEntry[] = [];

  for (const n of nodes) {
    // El registro plano expone el nodo original + el trail actual
    out.push({ node: n, trail: parentTrail });

    // Para los hijos, el trail incluye al nodo actual
    if (n.children?.length) {
      const nextTrail: TrailItem[] = [
        ...parentTrail,
        { id: n.id, label: n.label },
      ];
      out.push(...flattenTree(n.children, nextTrail));
    }
  }

  return out;
}
