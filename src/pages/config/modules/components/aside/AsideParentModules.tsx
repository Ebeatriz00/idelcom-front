import {
  Button,
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useParentModulesList } from "@/sharedKernel";
import { Search } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

/** -------------------- Tipos -------------------- */

type ParentModule = {
  id?: number | string;
  parentModulesId?: number | string;
  modulesId?: number | string;
  title?: string;
  name?: string;
};

type PaginationState = {
  search: string;
  pageIndex: number;
  pageSize: number;
};

/** -------------------- Utils -------------------- */
const getParentModulesId = (p: ParentModule) =>
  p?.parentModulesId ?? p?.modulesId ?? p?.id;

const getTitleLabel = (p: ParentModule) =>
  p?.title ?? p?.name ?? `Sección ${getParentModulesId(p) ?? ""}`;

const cx = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** -------------------- Componente -------------------- */
export function AsideParentModules({
  selectedId,
  onSelect,
}: {
  selectedId?: number | string | null;
  onSelect: (row: ParentModule) => void;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [pagination, setPagination] = useState<PaginationState>({
    search: "",
    pageIndex: 0,
    pageSize: 12,
  });

  // Sincroniza el search del paginado SOLO cuando el usuario deja de tipear
  useEffect(() => {
    setPagination((p) => ({ ...p, search: debouncedSearch, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isFetching, isError } = useParentModulesList(
    pagination.search,
    pagination.pageIndex,
    pagination.pageSize
  );

  const items: ParentModule[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount =
    data?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, pagination.pageSize)));

  const listLabelId = useId();

  const isSelected = useCallback(
    (row: ParentModule) =>
      selectedId != null &&
      String(selectedId) === String(getParentModulesId(row)),
    [selectedId]
  );

  const handlePrev = () =>
    setPagination((p) => ({
      ...p,
      pageIndex: Math.max(0, p.pageIndex - 1),
    }));

  const handleNext = () =>
    setPagination((p) => ({
      ...p,
      pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
    }));

  const onKeyNav = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const current = document.activeElement as HTMLElement | null;
    if (!current) return;
    const all = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>(
        'button[data-row="pm"]'
      )
    );
    const idx = all.indexOf(current as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = all[Math.min(all.length - 1, idx + 1)] ?? all[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = all[Math.max(0, idx - 1)] ?? all[all.length - 1];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      all[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      all[all.length - 1]?.focus();
    }
  };

  const content = useMemo(() => {
    // Estado error
    if (isError) {
      return (
        <div className="p-3 text-sm text-red-600">
          Ocurrió un error al cargar las secciones.
        </div>
      );
    }

    // Skeleton
    if (isFetching && items.length === 0) {
      return (
        <ul className="divide-y divide-gray-100" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="px-3 py-3">
              <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-1" />
              <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            </li>
          ))}
        </ul>
      );
    }

    // Vacío
    if (!isFetching && total === 0) {
      return (
        <div className="p-3 text-sm text-gray-500">
          {pagination.search
            ? "No se encontraron secciones para tu búsqueda."
            : "Aún no hay secciones."}
        </div>
      );
    }

    // Lista
    return (
      <ul
        className="divide-y divide-gray-100"
        role="listbox"
        aria-labelledby={listLabelId}
        onKeyDown={onKeyNav}
      >
        {items.map((p) => {
          const id = getParentModulesId(p);
          const selected = isSelected(p);
          return (
            <li key={id}>
              <button
                type="button"
                data-row="pm"
                onClick={() => onSelect(p)}
                className={cx(
                  "w-full text-left px-3 py-2 transition",
                  "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                  selected
                    ? "bg-gray-50 border border-gray-200"
                    : "border border-transparent"
                )}
                role="option"
                aria-selected={selected}
              >
                <div className="font-medium text-sm text-gray-900 truncate">
                  {getTitleLabel(p)}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [
    isError,
    isFetching,
    items,
    listLabelId,
    onSelect,
    pagination.search,
    total,
    isSelected,
  ]);

  return (
      <CardSimple>
        <CardHeader className="pb-2">
          <CardTitle id={listLabelId}>Secciones</CardTitle>

          <div className="relative mt-2">
            <InputSea
              placeholder="Buscar sección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Buscar sección"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border border-gray-200 rounded-lg max-h-[460px] overflow-auto bg-white shadow-inner-sm">
            {content}
          </div>

          {/* Footer de paginación simple */}
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-600">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handlePrev}
              disabled={pagination.pageIndex <= 0 || isFetching}
            >
              Ant
            </Button>

            <span>
              Pág {Math.min(pagination.pageIndex + 1, pageCount)} / {pageCount}
              {typeof total === "number" && total > 0
                ? ` · ${total} items`
                : ""}
              {isFetching ? " · cargando..." : ""}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleNext}
              disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
            >
              Sig
            </Button>
          </div>
        </CardContent>
      </CardSimple>
  );
}
