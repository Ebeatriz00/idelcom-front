import type { TreeData, TreeNode } from "../types";

/**
 * Busca el padre de `node` usando los índices de TreeData.
 * Devuelve null si es raíz o no existe en índices.
 */
export function findParent(tree: TreeData, node: TreeNode): TreeNode | null {
  const parentId = tree.parentOf.get(node.id) ?? node.parentId ?? null;
  if (parentId == null) return null;
  return tree.byId.get(parentId) ?? null;
}
