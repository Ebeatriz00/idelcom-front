import type { ModulesResponseDto } from "@/application";
import type { TreeNode } from "../types";

/**
 * Convierte la lista plana de módulos en un árbol jerárquico.
 * 
 * - Agrupa por `parentModulesId`
 * - Asegura que los hijos se guarden en `children`
 * - Ordena por `orderNo`
 */
export function mapModulesToTreeNodes(items: ModulesResponseDto[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  // Crear nodos base
  for (const m of items) {
    const node: TreeNode = {
      id: m.modulesId,
      label: m.modulesName,
      path: m.path,
      status: m.status,
      orderNo: m.orderNo ?? 0,
      code: m.code,
      parentId: m.parentModulesId ?? null,
      children: [],
    };
    map.set(node.id, node);
  }

  // Enlazar padres e hijos
  for (const node of map.values()) {
    if (node.parentId != null && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Ordenar por orderNo (recursivamente)
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.orderNo - b.orderNo);
    for (const child of nodes) sortNodes(child.children);
  };
  sortNodes(roots);

  return roots;
}
