import type { OptionItem, PagedSelect } from "@/application";
import { fetchConceptTypeSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkConceptType = {
  /** Clave base */
  all: ["concept-type"] as const,

  /** Select con buscador */
  selects: () => [...qkConceptType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkConceptType.selects(), page, search ?? "", pageSize] as const,
};

export function useConceptType(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkConceptType.select(page, s, pageSize),
    queryFn: () => fetchConceptTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}