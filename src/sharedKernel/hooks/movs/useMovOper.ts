import type { OptionItem, PagedSelect } from "@/application";
import { fetchMovOperSelect } from "@/infrastructure/api-clients/movs/movOper.client";
import { useQuery } from "@tanstack/react-query";

export const qkMovOper = {
  /** Clave base */
  all: ["movOper"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkMovOper.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovOper.selects(), page, search ?? "", pageSize] as const,
};

export function useMovOperOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMovOper.select(page, s, pageSize),
    queryFn: () => fetchMovOperSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
