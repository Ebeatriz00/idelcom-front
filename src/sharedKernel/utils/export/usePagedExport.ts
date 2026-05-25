import { useCallback } from "react";
import { fetchAllPaged } from "@/sharedKernel/utils/export/fetchAllPaged";

export type PagedResult<T> = {
  items: T[];
  total: number;
  pageCount: number;
};

export type FetchPageFn<T, P> = (args: {
  page: number;      // 1-based
  pageSize: number;
  params: P;
}) => Promise<PagedResult<T>>;

export function usePagedExport<T, P>(args: {
  canFetch: boolean;
  params: P;
  exportPageSize?: number;
  fetchPage: FetchPageFn<T, P>;
}) {
  const { canFetch, params, exportPageSize = 1000, fetchPage } = args;

  const getAllForExport = useCallback(
    async (onPct?: (pct: number) => void) => {
      if (!canFetch) return [];

      return fetchAllPaged<T>({
        pageSize: exportPageSize,
        onProgress: (p) => p.pct != null && onPct?.(p.pct),
        fetchPage: async (pageIndex, pageSize) => {
          const r = await fetchPage({
            page: pageIndex + 1,
            pageSize,
            params,
          });

          return { data: r.items, total: r.total, pageCount: r.pageCount };
        },
      });
    },
    [canFetch, params, exportPageSize, fetchPage],
  );

  const getForPdfLimit = useCallback(
    async (limit: number, onPct?: (pct: number) => void) => {
      if (!canFetch) return [];
      const r = await fetchPage({ page: 1, pageSize: limit, params });
      onPct?.(100);
      return r.items.slice(0, limit);
    },
    [canFetch, params, fetchPage],
  );

  return { getAllForExport, getForPdfLimit };
}
