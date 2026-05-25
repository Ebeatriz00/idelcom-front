import type { OptionItem, PagedSelect } from "@/application";
import { fetchTypeAnalysisSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkTypeAnalysis = {
  /** Clave base */
  all: ["type-analysis"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkTypeAnalysis.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkTypeAnalysis.selects(), page, search ?? "", pageSize] as const,
};

export function useTypeAnalysisOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkTypeAnalysis.select(page, s, pageSize),
    queryFn: () => fetchTypeAnalysisSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
