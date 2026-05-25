import { Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

export type FolderNode = {
  key: string;
  label: string;
  canView: boolean;
  canAdd: boolean;
  canDownload: boolean;
  candDelete: boolean;
  isGroup?: boolean;
  children?: FolderNode[];
};

type FolderTreeProps = {
  folders: FolderNode[];
  selected: string | null;
  onSelect: (key: string) => void;
};

export function FolderTree({ folders, selected, onSelect }: FolderTreeProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasSelectedDescendant = (
    node: FolderNode,
    selectedKey: string | null
  ): boolean => {
    if (!selectedKey || !node.children) return false;
    return node.children.some(
      (c) =>
        c.key === selectedKey ||
        (c.children && hasSelectedDescendant(c, selectedKey))
    );
  };

  const renderNode = (f: FolderNode, level = 0) => {
    if (!f.canView) return null;

    const isGroup = !!(f.isGroup || f.children?.length);
    const isSelected = selected === f.key;
    const childSelected = hasSelectedDescendant(f, selected);
    const isOpen = isGroup ? openGroups[f.key] ?? childSelected : false;
    const isActive = isSelected;

    const handleClick = () => {
      if (isGroup && f.isGroup) {
        toggleGroup(f.key);
        return;
      }

      if (isGroup) {
        toggleGroup(f.key);
      }
      onSelect(f.key); 
    };

    const textSizeClass = level > 0 ? "text-xs" : "text-sm";
    const iconSizeClass = level > 0 ? "w-3 h-3" : "w-4 h-4";

    return (
      <li key={f.key}>
        <button
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md transition text-left ${
            isActive
              ? "bg-amber-100 text-amber-800"
              : "hover:bg-gray-100 text-gray-700"
          } ${f.isGroup ? "font-semibold" : ""} ${textSizeClass}`}
          style={{ paddingLeft: 8 + level * 8 }}
        >
          <span className="flex items-center gap-2">
            {isGroup ? (
              isOpen ? (
                <FolderOpen className={iconSizeClass} />
              ) : (
                <Folder className={iconSizeClass} />
              )
            ) : (
              <Folder className={iconSizeClass} />
            )}
            <span>{f.label}</span>
          </span>

        </button>

        {isGroup && isOpen && f.children && (
          <ul className="mt-1 ml-3 border-l border-gray-200 pl-2 space-y-1">
            {f.children.map((c) => renderNode(c, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className="space-y-1 text-sm">
      {folders.filter((f) => f.canView).map((f) => renderNode(f))}
    </ul>
  );
}
