import type { OptionItem, PagedSelect } from "@/application";
import { fetchAccountTypeSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkAccountType = {
  /** Clave base */
  all: ["account-type"] as const,

  /** Select con buscador (si tu backend lo usa para combos u opciones) */
  selects: () => [...qkAccountType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkAccountType.selects(), page, search ?? "", pageSize] as const,
};

export function useAccountTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAccountType.select(page, s, pageSize),
    queryFn: () => fetchAccountTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
