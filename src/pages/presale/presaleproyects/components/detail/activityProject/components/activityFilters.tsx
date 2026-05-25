import { Filter, X } from "lucide-react";
import { memo } from "react";
import { ActivityPriorityFilterSelect } from "../state/ActivityPriorityFilterSelect";
import { ActivityStateFilterSelect } from "../state/ActivityStateFilterSelect";
import type { RangeQuick } from "../utils/normalize";

type FiltersProps = {
  q: string;
  type: string;
  state: string;
  setState: (v: string) => void;
  stateOptions: any[];

  setPriority: (v: string) => void;
  priorityOptions: any[];
  range: RangeQuick;
  onChange: (
    next: Partial<Pick<FiltersProps, "q" | "type" | "state" | "range">>
  ) => void;
  onClear: () => void;
  onAnyChange: () => void;
};

export const Filters = memo(function Filters({
  q,
  type,
  state,
  stateOptions,
  priorityOptions,
  range,
  onChange,
  onClear,
  onAnyChange,
}: FiltersProps) {
  const set = (
    patch: Partial<Pick<FiltersProps, "q" | "type" | "state" | "range">>
  ) => onChange(patch);
  const norm = (v: string) => (v && v !== "Todos" ? v : "");
  return (
    <div className="px-4 sm:px-3 py-4 border-b border-gray-100 space-y-3">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Filter className="size-4" /> Filtros:
        </span>

        {/* Buscar */}
        <div className="relative w-full sm:w-64">
          <input
            value={q}
            onChange={(e) => set({ q: e.target.value })}
            className="block w-full h-10 rounded-full border border-gray-300 bg-white pl-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Buscar por título, persona…"
          />
          {q && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => set({ q: "" })}
              title="Limpiar"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Tipo */}
        <div className="relative w-full sm:w-38">
          <span className="block text-xs text-gray-500 mb-1">Prioridad</span>
          <ActivityPriorityFilterSelect
            value={type} // ✅ prioridad usa `type`
            onChange={(v) => {
              onChange({ type: norm(v) }); // ✅ setea `type`, no `state`
              onAnyChange();
            }}
            options={priorityOptions}
          />
        </div>

        <div className="relative w-full sm:w-38">
          <span className="block text-xs text-gray-500 mb-1">Estado</span>
          <ActivityStateFilterSelect
            value={state} // ✅ estado usa `state`
            onChange={(v) => {
              onChange({ state: norm(v) }); // ✅ setea `state`, no `type`
              onAnyChange();
            }}
            options={stateOptions}
          />
        </div>
        {/* Rangos rápidos */}
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-2 overflow-x-auto sm:overflow-visible no-scrollbar py-1 sm:flex-wrap">
            {(
              [
                "todas",
                "hoy",
                "semana",
                "mes",
                "vencidas",
                "completadas",
              ] as const
            ).map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => set({ range: r })}
                  aria-pressed={active}
                  className={[
                    "shrink-0 h-9 px-3 rounded-full text-xs border transition-colors",
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                  title={`Filtrar por ${r === "todas" ? "todas" : r}`}
                >
                  {r === "todas" ? "Todas" : r[0].toUpperCase() + r.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {(q || type || state || range !== "todas") && (
          <button
            onClick={onClear}
            className="text-xs text-gray-600 hover:text-gray-800 underline self-start"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  );
});
