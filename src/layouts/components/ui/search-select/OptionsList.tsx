import { Check } from "lucide-react";
export function OptionsList({
  listRef,
  listboxId,
  items,
  activeIndex,
  setActiveIndex,
  selectedValue,
  onSelect,
  onListScroll,
  renderOption,
  highlighter,
  isLoading,
  hasMore,
  onCreate,
  query,
}: any) {
  return (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-activedescendant={
        activeIndex >= 0 ? `opt-${activeIndex}` : undefined
      }
      className="max-h-64 overflow-y-auto overflow-x-hidden py-1"
      onScroll={onListScroll}
    >
      {items.length === 0 && !isLoading ? (
        <li className="px-3 py-2 text-sm text-gray-500">
          Sin resultados
          {onCreate && query && (
            <>
              {" "}
              ·{" "}
              <button className="underline" onClick={() => onCreate(query)}>
                Crear “{query}”
              </button>
            </>
          )}
        </li>
      ) : (
        items.map((opt: any, idx: number) => {
          const selected = selectedValue === opt.value;
          const active = idx === activeIndex;
          return (
            <li
              id={`opt-${idx}`}
              key={opt.value}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(opt)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                active ? "bg-blue-50" : ""
              } ${selected ? "font-medium" : ""}`}
            >
              {selected ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <span className="w-4" />
              )}
              <div className="min-w-0">
                {renderOption ? (
                  renderOption(opt, query, selected, active)
                ) : (
                  <span className="truncate">{highlighter(opt.label)}</span>
                )}
              </div>
            </li>
          );
        })
      )}
      {hasMore && (
        <li className="px-3 py-2 text-xs text-gray-500">
          {isLoading ? "Cargando más..." : "Desplázate para cargar más"}
        </li>
      )}
    </ul>
  );
}
