import type { OptionItem, PagedSelect } from "@/application";
import { fetchMovVisSelect } from "@/infrastructure/api-clients/movs/movVis.client";
import { useQuery } from "@tanstack/react-query";

export const qkMovVis = {
  /** Clave base */
  all: ["movVis"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkMovVis.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovVis.selects(), page, search ?? "", pageSize] as const,
};

export function useMovVisOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMovVis.select(page, s, pageSize),
    queryFn: () => fetchMovVisSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}