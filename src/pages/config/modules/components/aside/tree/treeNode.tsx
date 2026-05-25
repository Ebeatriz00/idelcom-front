// treeNode.tsx
import { memo, useMemo, useState } from "react";
import type { TreeNode as TNode } from "./types";
import { icons } from "lucide-react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function toPascal(raw?: string | null): string | null {
  if (!raw) return null;
  if (/^[A-Z][A-Za-z0-9]*$/.test(raw)) return raw;
  return raw
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");
}

function pickIcon(raw?: string | null): LucideIcon {
  const key = toPascal(raw) ?? "";
  return (icons as Record<string, LucideIcon>)[key] ?? FileText;
}

type Props = { node: TNode; onSelect: (n: TNode) => void; level?: number };

export const TreeNode = memo(function TreeNode({ node, onSelect, level = 0 }: Props) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!(node.children && node.children.length);
  const Icon = useMemo(() => pickIcon((node as any).icon), [node]);

  return (
    <div className="select-none">
      <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
        <button
          type="button"
          className="flex items-center gap-1 text-gray-700"
          onClick={() => (hasChildren ? setOpen(v => !v) : onSelect(node))}
          aria-label={hasChildren ? (open ? "Contraer" : "Expandir") : "Seleccionar"}
        >
          {hasChildren ? (open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4" />}

          <span className="w-4 h-4 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </span>

          <span className="truncate" onClick={() => onSelect(node)}>
            {node.label}
          </span>
        </button>

        <span className={`ml-auto text-2xs rounded px-1.5 py-0.5 ${node.status === "1" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {node.status === "1" ? "Activo" : "Inactivo"}
        </span>
      </div>

      {hasChildren && open && (
        <div className="ml-5 border-l pl-3">
          {node.children!.map(c => (
            <TreeNode key={c.id} node={c} onSelect={onSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
});
