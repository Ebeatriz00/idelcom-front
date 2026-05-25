export type TreeNode = {
  id: number;
  code: string;
  label: string;
  icon?: string | null;   // usa esto
  path?: string | null;
  status?: string;
  orderNo: number;
  parentId?: number | null;
  children: TreeNode[];
};

export type TreeData = {
  roots: TreeNode[];
  byId: Map<number, TreeNode>;
  parentOf: Map<number, number | null>;
};

export type TrailItem = { id: number; label: string };

export type FlatEntry = {
  node: TreeNode;
  trail: TrailItem[];
};
