import type { TreeNode } from "../types";

// utils/nav.ts
export const isFolder = (n?: Pick<TreeNode, "path" | "children"> | null) =>
  !n || !n.path || n.path.trim() === "" || (n.children?.length ?? 0) > 0;
