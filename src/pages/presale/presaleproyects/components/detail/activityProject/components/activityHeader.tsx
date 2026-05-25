
import { usePreSaleProyectsPerms } from "@/pages/presale/presaleproyects/hooks/project.perms";
import { ChevronDown, Plus } from "lucide-react";
import { memo } from "react";

type HeaderProps = {
  title?: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
};

export const Header = memo(function Header({
  title = "Actividades",
  count,
  open,
  onToggle,
  onAdd,
}: HeaderProps) {
  const { canAddActivityProject } = usePreSaleProyectsPerms();
  return (
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onToggle}
          className="group flex items-center gap-2 text-left min-w-0"
          aria-expanded={open}
          aria-controls="panel-activities"
        >
          <h2 className="text-base font-semibold text-gray-800 tracking-tight truncate">
            {title}
          </h2>
          <ChevronDown
            className={`size-5 shrink-0 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              open ? "rotate-180" : ""
            }`}
          />
          <span className="ml-1 text-xs text-gray-500 whitespace-nowrap">
            {count} ítems
          </span>
        </button>

        <div className="flex">
          {canAddActivityProject && (
          <button
            onClick={onAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 h-10 text-sm font-medium bg-gray-900 text-white hover:bg-black"
            title="Agregar actividad"
          >
            <Plus className="size-4" /> Agregar
          </button>
          )}
        </div>
      </div>
    </div>
  );
});
