import type { OptionItem, PagedSelect } from "@/application";
import { fetchMovSunatSelect } from "@/infrastructure/api-clients/movs/movSunat.client";
import { useQuery } from "@tanstack/react-query";

export const qkMovSunat = {
  /** Clave base */
  all: ["movSunat"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkMovSunat.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovSunat.selects(), page, search ?? "", pageSize] as const,
};

export function useMovSunatOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMovSunat.select(page, s, pageSize),
    queryFn: () => fetchMovSunatSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}