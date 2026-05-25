// hooks/usePagedSelect.ts
import type { PagedSelect } from "@/application";
import { useQuery } from "@tanstack/react-query";

type Fetcher<T> = (page: number, search: string, pageSize: number) => Promise<PagedSelect<T>>;

export function usePagedSelect<T>({
  fetcher,
  keys,           // => resultado de createSelectKeys("algo")
  search,
  page,
  pageSize = 10,
  enabled = true,
}: {
  fetcher: Fetcher<T>;
  keys: { page: (search: string, page: number, pageSize: number) => readonly unknown[] };
  search: string;
  page: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<T>>({
    queryKey: keys.page(s, page, pageSize),
    queryFn: () => fetcher(page, s, pageSize),
    placeholderData: (prev) => prev,  
    staleTime: 30_000,
    enabled,
  });
}
