// hooks/useInfinitePagedSelect.ts
import type { PagedSelect } from "@/application";
import { useInfiniteQuery } from "@tanstack/react-query";

type Fetcher<T> = (page: number, search: string, pageSize: number) => Promise<PagedSelect<T>>;

export function useInfinitePagedSelect<T>({
  fetcher,
  baseKey,
  search,
  pageSize = 10,
  enabled = true,
}: {
  fetcher: Fetcher<T>;
  baseKey: string;   // e.g. "modules", "profiles"
  search: string;
  pageSize?: number;
  enabled?: boolean;
}) {
  const s = (search ?? "").trim();

  return useInfiniteQuery({
    queryKey: [baseKey, "select", s, pageSize] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetcher(pageParam as number, s, pageSize),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled,
  });
}
