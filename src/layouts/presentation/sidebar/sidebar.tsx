import { cn } from "@/sharedKernel/lib/cn";
import { CardContent, CardHeader, CardSimple, CardTitle } from "../cards/cardSimple";
import { InputSea } from "../inputs/inputSea";
import { SearchIcon } from "lucide-react";
import { Button } from "@/layouts/components/ui/button";


export type SidebarItem = {
  id: number | string;
  label: string;
  description?: string;
};

type SidebarProps = {
  /** Título del sidebar */
  title: string;
  /** Placeholder del buscador */
  searchPlaceholder?: string;
  /** Texto de cargando */
  loadingText?: string;
  /** Lista de items */
  items: SidebarItem[];
  /** Id del item seleccionado */
  selectedId?: number | string | null;
  /** Callback al seleccionar */
  onSelect: (item: SidebarItem) => void;
  /** Estado de cargando */
  isLoading?: boolean;
  /** Total y paginación */
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export function Sidebar({
  title,
  searchPlaceholder = "Buscar...",
  loadingText = "Cargando...",
  items,
  selectedId,
  onSelect,
  isLoading,
  total,
  page,
  totalPages,
  onPageChange,
}: SidebarProps) {
  return (
    <CardSimple className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="relative mt-2">
          <InputSea placeholder={searchPlaceholder} className="pl-9" />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="border rounded-md max-h-[460px] overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">
              {loadingText}
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                const isActive = selectedId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={cn(
                        "w-full text-left px-3 py-2 hover:bg-muted",
                        isActive && "bg-muted"
                      )}
                    >
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}

              {items.length === 0 && !isLoading && (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  Sin resultados
                </li>
              )}
            </ul>
          )}
        </div>

        {totalPages && totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Total: {total ?? 0}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(Math.max(1, (page ?? 1) - 1))}
                disabled={(page ?? 1) <= 1}
              >
                Anterior
              </Button>
              <span>
                Pág {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPageChange?.(Math.min(totalPages, (page ?? 1) + 1))
                }
                disabled={(page ?? 1) >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </CardSimple>
  );
}
