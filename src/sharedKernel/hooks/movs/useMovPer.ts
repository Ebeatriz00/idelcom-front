import type { OptionItem, PagedSelect } from "@/application";
import { fetchMovPerSelect } from "@/infrastructure/api-clients/movs/movPer.client";
import { useQuery } from "@tanstack/react-query";

export const qkMovPer = {
  /** Clave base */
  all: ["movPer"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkMovPer.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovPer.selects(), page, search ?? "", pageSize] as const,
};

export function useMovPerOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMovPer.select(page, s, pageSize),
    queryFn: () => fetchMovPerSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}