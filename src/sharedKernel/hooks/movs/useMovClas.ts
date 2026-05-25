import type { OptionItem, PagedSelect } from "@/application";
import { fetchMovClasSelect } from "@/infrastructure/api-clients/movs/movClas.client";
import { useQuery } from "@tanstack/react-query";

export const qkMovClas = {
  all: ["movclas"] as const,

  selects: () => [...qkMovClas.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkMovClas.selects(), page, search ?? "", pageSize] as const,
};

export function useMovClasOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMovClas.select(page, s, pageSize),
    queryFn: () => fetchMovClasSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}