import type { OptionItem, PagedSelect } from "@/application";
import { fetchAccountLevelSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkAccountLevel = {
  /** Clave base */
  all: ["account-level"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkAccountLevel.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAccountLevel.selects(), page, search ?? "", pageSize] as const,
};

export function useAccountLevelOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAccountLevel.select(page, s, pageSize),
    queryFn: () => fetchAccountLevelSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
