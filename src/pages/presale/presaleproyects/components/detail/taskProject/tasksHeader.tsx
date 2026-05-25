import { cn } from "@/sharedKernel";
import { ChevronDown, Plus } from "lucide-react";

export function TasksHeader({
  open,
  count,
  onToggle,
  onAdd,
}: {
  open: boolean;
  count: number;
  onToggle: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
      <div className="flex items-center gap-1.5">
        <h2 className="text-base font-semibold text-gray-800 tracking-tight">
          Tareas
        </h2>
        <span
          className={`inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 ${
            count > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black transition-colors"
            title="Nueva tarea"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          title={open ? "Colapsar" : "Expandir"}
        >
          <ChevronDown
            className={cn(
              "size-5 text-gray-500 transition-transform duration-300",
              open ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}