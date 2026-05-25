import type { TreeNode } from "./types";
import { TreeNode as TreeNodeItem } from "./treeNode";

type Props = {
  nodes: TreeNode[];
  onSelect: (n: TreeNode) => void;
  maxHeightClassName?: string; // ej: "max-h-[360px]"
};

export function TreeView({ nodes, onSelect, maxHeightClassName = "max-h-[360px]" }: Props) {
  return (
    <div className={`${maxHeightClassName} overflow-auto`}>
      {nodes.map((n) => (
        <TreeNodeItem key={n.id} node={n} onSelect={onSelect} />
      ))}
    </div>
  );
}
